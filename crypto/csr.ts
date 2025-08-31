import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import * as pvtsutils from 'pvtsutils';

import { OIDS } from '../constants';
import { SANs, KeyUsageFlags, BasicConstraints, Subject } from '../types';
import { ipToBuf, toPEM } from '../utils/helpers';

interface BuildCsrParams {
	subject: Subject;
	san?: SANs;
	ku?: KeyUsageFlags;
	eku?: string[];
	bc?: BasicConstraints;
	hash?: "SHA-256" | "SHA-384";
	keyPair: CryptoKeyPair;
}

function keyUsageToBitString(ku: KeyUsageFlags): asn1js.BitString {
	const bitArray = new ArrayBuffer(2);
	const bitView = new Uint8Array(bitArray);

	if (ku.digitalSignature) bitView[0] |= 0x80;
	if (ku.contentCommitment) bitView[0] |= 0x40;
	if (ku.keyEncipherment) bitView[0] |= 0x20;
	if (ku.dataEncipherment) bitView[0] |= 0x10;
	if (ku.keyAgreement) bitView[0] |= 0x08;
	if (ku.keyCertSign) bitView[0] |= 0x04;
	if (ku.cRLSign) bitView[0] |= 0x02;
	if (ku.encipherOnly) bitView[0] |= 0x01;
	if (ku.decipherOnly) bitView[1] |= 0x80;

	const usedBits = ku.decipherOnly ? 9 : 8;
	const unused = (8 - (usedBits % 8)) % 8;
	return new asn1js.BitString({ valueHex: bitArray, unusedBits: unused });
}

function mapSubjectKeyToOID(k: string): string {
	switch (k) {
		case "CN": return OIDS.cn;
		case "O": return OIDS.o;
		case "OU": return OIDS.ou;
		case "C": return OIDS.c;
		case "ST": return OIDS.st;
		case "L": return OIDS.l;
		case "emailAddress": return OIDS.email;
		default: return k; // Allow custom OIDs
	}
}

export async function buildCSR({ subject, san, ku, eku, bc, hash = "SHA-256", keyPair }: BuildCsrParams) {
	const csr = new pkijs.CertificationRequest();

	// Set subject
	csr.subject.typesAndValues = Object.entries(subject)
		.filter(([, v]) => v && v.length > 0)
		.map(([k, v]) => new pkijs.AttributeTypeAndValue({
			type: mapSubjectKeyToOID(k),
			value: new asn1js.Utf8String({ value: v })
		}));

	// Set public key
	await csr.subjectPublicKeyInfo.importKey(keyPair.publicKey);

	// Set extensions
	const extensions = new pkijs.Extensions();

	const hasSan = san && Object.values(san).some(v => v && v.length > 0);
	if (hasSan) {
		const altNames = new pkijs.GeneralNames({
			names: [
				...san.dns?.map(v => new pkijs.GeneralName({ type: 2, value: v })) ?? [],
				...san.ip?.map(v => {
					try {
						const buf = ipToBuf(v);
						return new pkijs.GeneralName({ type: 7, value: new asn1js.OctetString({ valueHex: buf }) });
					} catch (e) {
						console.error(`Invalid IP address skipped: ${v}`);
						return null;
					}
				}).filter(v => v) ?? [],
				...san.email?.map(v => new pkijs.GeneralName({ type: 1, value: v })) ?? [],
				...san.uri?.map(v => new pkijs.GeneralName({ type: 6, value: v })) ?? [],
				...san.upn?.map(v => new pkijs.GeneralName({
					type: 0,
					value: new asn1js.Sequence({
						value: [
							new asn1js.ObjectIdentifier({ value: OIDS.upnOtherName }),
							new asn1js.Constructed({
								idBlock: { tagClass: 3, tagNumber: 0 },
								value: [new asn1js.Utf8String({ value: v })]
							})
						]
					})
				})) ?? [],
			]
		});
		extensions.extensions.push(new pkijs.Extension({ extnID: OIDS.san, critical: false, extnValue: altNames.toSchema().toBER(false) }));
	}

	const hasKu = ku && Object.values(ku).some(v => v);
	if (hasKu) {
		const bits = keyUsageToBitString(ku);
		extensions.extensions.push(new pkijs.Extension({ extnID: OIDS.ku, critical: true, extnValue: bits.toBER(false) }));
	}

	if (eku?.length) {
		const extku = new pkijs.ExtKeyUsage({ keyPurposes: eku });
		extensions.extensions.push(new pkijs.Extension({ extnID: OIDS.eku, critical: false, extnValue: extku.toSchema().toBER(false) }));
	}

	if (bc) {
		const basic = new pkijs.BasicConstraints({ cA: !!bc.ca, pathLenConstraint: bc.pathLen });
		extensions.extensions.push(new pkijs.Extension({ extnID: OIDS.bc, critical: true, extnValue: basic.toSchema().toBER(false) }));
	}

	if (extensions.extensions.length > 0) {
		csr.attributes = [];
		csr.attributes.push(
			new pkijs.Attribute({
				type: OIDS.extensionRequest,
				values: [new asn1js.Sequence({ value: extensions.toSchema().valueBlock.value })]
			})
		);
	}

	// Sign the CSR
	await csr.sign(keyPair.privateKey, hash);

	const der = csr.toSchema().toBER(false);
	const pem = toPEM(der, "CERTIFICATE REQUEST");

	const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
	const pkPem = toPEM(pkcs8, "PRIVATE KEY");

	return { csrPem: pem, privateKeyPem: pkPem, privateKeyDer: pkcs8 };
}