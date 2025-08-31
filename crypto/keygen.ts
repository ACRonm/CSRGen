
export async function generateKeypair(alg: "RSA" | "EC", sizeOrCurve: number | "P-256" | "P-384"): Promise<CryptoKeyPair> {
	const extractable = true;

	if (alg === "RSA") {
		const modulusLength = typeof sizeOrCurve === "number" ? sizeOrCurve : 2048;
		return crypto.subtle.generateKey({
			name: "RSASSA-PKCS1-v1_5",
			modulusLength,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: "SHA-256"
		}, extractable, ["sign", "verify"]);
	}

	// EC
	const namedCurve = (typeof sizeOrCurve === 'string' ? sizeOrCurve : "P-256");
	return crypto.subtle.generateKey({ name: "ECDSA", namedCurve }, extractable, ["sign", "verify"]);
}
