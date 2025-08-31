
export interface Subject {
	CN: string;
	O: string;
	OU: string;
	C: string;
	ST: string;
	L: string;
	emailAddress: string;
}

export interface SANs {
	dns?: string[];
	ip?: string[];
	email?: string[];
	uri?: string[];
	upn?: string[];
	dirName?: string[];
	rid?: string[];
}

export interface KeyUsageFlags {
	digitalSignature?: boolean;
	contentCommitment?: boolean;
	keyEncipherment?: boolean;
	dataEncipherment?: boolean;
	keyAgreement?: boolean;
	keyCertSign?: boolean;
	cRLSign?: boolean;
	encipherOnly?: boolean;
	decipherOnly?: boolean;
}

export interface BasicConstraints {
	ca?: boolean;
	pathLen?: number;
}

export interface CsrWorkerRequest {
	subject: Subject;
	san: SANs;
	key: {
		algorithm: 'RSA' | 'EC';
		params: number | 'P-256' | 'P-384';
	};
	ku?: KeyUsageFlags;
	eku?: string[];
	bc?: BasicConstraints;
	encryptPass?: string;
}
