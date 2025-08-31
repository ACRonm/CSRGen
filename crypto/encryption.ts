
import * as forge from 'node-forge';
import { toPEM } from '../utils/helpers';

export function encryptPkcs8(pkcs8Der: ArrayBuffer, passphrase: string): string {
	const pkcs8Asn1 = forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8Der)));

	const encrypted = forge.pki.encryptPrivateKeyInfo(pkcs8Asn1, passphrase, {
		algorithm: 'aes256',
		count: 200000, // PBKDF2 iterations
		prfAlgorithm: 'sha256',
	});

	const der = forge.asn1.toDer(encrypted).getBytes();
	const derArrayBuffer = new Uint8Array(der.length);
	for (let i = 0; i < der.length; i++) {
		derArrayBuffer[i] = der.charCodeAt(i);
	}

	return toPEM(derArrayBuffer.buffer, 'ENCRYPTED PRIVATE KEY');
}
