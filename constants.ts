
import { KeyUsageFlags } from './types';

export const OIDS = {
	cn: "2.5.4.3",
	o: "2.5.4.10",
	ou: "2.5.4.11",
	c: "2.5.4.6",
	st: "2.5.4.8",
	l: "2.5.4.7",
	email: "1.2.840.113549.1.9.1",
	san: "2.5.29.17",
	eku: "2.5.29.37",
	ku: "2.5.29.15",
	bc: "2.5.29.19",
	upnOtherName: "1.3.6.1.4.1.311.20.2.3",
	smartCardLogon: "1.3.6.1.4.1.311.20.2.2",
	serverAuth: "1.3.6.1.5.5.7.3.1",
	clientAuth: "1.3.6.1.5.5.7.3.2",
	emailProtection: "1.3.6.1.5.5.7.3.4",
	codeSigning: "1.3.6.1.5.5.7.3.3",
	ocspSigning: "1.3.6.1.5.5.7.3.9",
	anyPolicy: "2.5.29.32.0",
	extensionRequest: "1.2.840.113549.1.9.14"
};

export const KEY_USAGE_FLAGS: { id: keyof KeyUsageFlags, label: string }[] = [
	{ id: 'digitalSignature', label: 'Digital Signature' },
	{ id: 'contentCommitment', label: 'Content Commitment' },
	{ id: 'keyEncipherment', label: 'Key Encipherment' },
	{ id: 'dataEncipherment', label: 'Data Encipherment' },
	{ id: 'keyAgreement', label: 'Key Agreement' },
	{ id: 'keyCertSign', label: 'Certificate Sign' },
	{ id: 'cRLSign', label: 'CRL Sign' },
	{ id: 'encipherOnly', label: 'Encipher Only' },
	{ id: 'decipherOnly', label: 'Decipher Only' },
];

export const EKU_OPTIONS: { name: string; oid: string }[] = [
	{ name: 'Server Authentication', oid: OIDS.serverAuth },
	{ name: 'Client Authentication', oid: OIDS.clientAuth },
	{ name: 'Code Signing', oid: OIDS.codeSigning },
	{ name: 'Email Protection', oid: OIDS.emailProtection },
	{ name: 'OCSP Signing', oid: OIDS.ocspSigning },
	{ name: 'Smart Card Logon', oid: OIDS.smartCardLogon },
	{ name: 'Any Policy', oid: OIDS.anyPolicy },
];

export const RSA_KEY_SIZES = [2048, 3072, 4096];
export const EC_CURVES = ['P-256', 'P-384'];
