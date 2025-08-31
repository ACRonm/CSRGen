
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Subject, SANs, KeyUsageFlags, BasicConstraints, CsrWorkerRequest } from './types';
import { KEY_USAGE_FLAGS, EKU_OPTIONS, RSA_KEY_SIZES, EC_CURVES } from './constants';
import { Section } from './components/Section';
import { Input } from './components/Input';
import { TagInput } from './components/TagInput';
import { CheckboxGrid } from './components/CheckboxGrid';
import { OutputSection } from './components/OutputSection';

export default function App() {
	const [subject, setSubject] = useState<Subject>({ CN: '', O: '', OU: '', C: '', ST: '', L: '', emailAddress: '' });
	const [sans, setSans] = useState<SANs>({ dns: [], ip: [], email: [], uri: [], upn: [] });
	const [keyAlgorithm, setKeyAlgorithm] = useState<'RSA' | 'EC'>('RSA');
	const [rsaKeySize, setRsaKeySize] = useState<number>(2048);
	const [ecCurve, setEcCurve] = useState<'P-256' | 'P-384'>('P-256');
	const [keyUsage, setKeyUsage] = useState<KeyUsageFlags>({ digitalSignature: true, keyEncipherment: true });
	const [extendedKeyUsage, setExtendedKeyUsage] = useState<string[]>([]);
	const [basicConstraints, setBasicConstraints] = useState<BasicConstraints>({ ca: false });
	const [passphrase, setPassphrase] = useState('');

	const [csr, setCsr] = useState('');
	const [privateKey, setPrivateKey] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const workerRef = useRef<Worker>();

	useEffect(() => {
		// FIX: The worker uses `importScripts`, which is not available in module workers.
		// Removed `{ type: 'module' }` to instantiate it as a classic worker.
		workerRef.current = new Worker(new URL('./workers/csr.worker.ts', import.meta.url));

		workerRef.current.onmessage = (event: MessageEvent) => {
			setIsLoading(false);
			const { ok, csrPem, keyPem, error: workerError } = event.data;
			if (ok) {
				setCsr(csrPem);
				setPrivateKey(keyPem);
				setError('');
			} else {
				setCsr('');
				setPrivateKey('');
				setError(workerError);
			}
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, []);

	const handleSubjectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setSubject(prev => ({ ...prev, [name]: value }));
	}, []);

	const handleGenerate = useCallback(() => {
		setError('');
		const hasSubject = Object.values(subject).some(v => v.length > 0);
		const hasSans = Object.values(sans).some(v => v.length > 0);
		if (!hasSubject && !hasSans) {
			setError('CSR must have at least one Subject or Subject Alternative Name.');
			return;
		}

		setIsLoading(true);
		setCsr('');
		setPrivateKey('');

		const keyParams = keyAlgorithm === 'RSA' ? rsaKeySize : ecCurve;

		const request: CsrWorkerRequest = {
			subject,
			san: sans,
			key: {
				algorithm: keyAlgorithm,
				params: keyParams,
			},
			ku: keyUsage,
			eku: extendedKeyUsage,
			bc: basicConstraints,
			encryptPass: passphrase,
		};

		workerRef.current?.postMessage({ req: request });
	}, [subject, sans, keyAlgorithm, rsaKeySize, ecCurve, keyUsage, extendedKeyUsage, basicConstraints, passphrase]);

	return (
		<div className="min-h-screen bg-gray-900 font-sans text-gray-200 flex justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-6xl space-y-8">
				<header className="text-center">
					<h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">CSR Generator</h1>
					<p className="mt-2 text-gray-400 flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
						<span>All operations are performed locally in your browser. No data is uploaded.</span>
					</p>
				</header>

				<main className="space-y-6">
					<Section title="Subject" description="The primary identity information for the certificate.">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input label="Common Name (CN)" name="CN" value={subject.CN} onChange={handleSubjectChange} placeholder="e.g., example.com" />
							<Input label="Organization (O)" name="O" value={subject.O} onChange={handleSubjectChange} placeholder="e.g., Acme Corporation" />
							<Input label="Organizational Unit (OU)" name="OU" value={subject.OU} onChange={handleSubjectChange} placeholder="e.g., IT Department" />
							<Input label="Country (C)" name="C" value={subject.C} onChange={handleSubjectChange} placeholder="e.g., US" maxLength={2} />
							<Input label="State/Province (ST)" name="ST" value={subject.ST} onChange={handleSubjectChange} placeholder="e.g., California" />
							<Input label="Locality (L)" name="L" value={subject.L} onChange={handleSubjectChange} placeholder="e.g., San Francisco" />
							<Input label="Email Address" name="emailAddress" type="email" value={subject.emailAddress} onChange={handleSubjectChange} placeholder="e.g., admin@example.com" />
						</div>
					</Section>

					<Section title="Subject Alternative Names (SANs)" description="Additional identities. Required by modern browsers for SSL.">
						<div className="space-y-4">
							<TagInput label="DNS Names" values={sans.dns} setValues={(v) => setSans(p => ({ ...p, dns: v }))} placeholder="Add a DNS name and press Enter" />
							<TagInput label="IP Addresses" values={sans.ip} setValues={(v) => setSans(p => ({ ...p, ip: v }))} placeholder="Add an IP address and press Enter" />
							<TagInput label="Email Addresses" values={sans.email} setValues={(v) => setSans(p => ({ ...p, email: v }))} placeholder="Add an email and press Enter" type="email" />
							<TagInput label="URIs" values={sans.uri} setValues={(v) => setSans(p => ({ ...p, uri: v }))} placeholder="Add a URI and press Enter" />
							<TagInput label="User Principal Names (UPNs)" values={sans.upn} setValues={(v) => setSans(p => ({ ...p, upn: v }))} placeholder="Add a UPN and press Enter" />
						</div>
					</Section>

					<Section title="Key & Extensions" description="Configure the cryptographic key and certificate extensions.">
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Key Algorithm</label>
								<div className="flex rounded-md shadow-sm bg-gray-800 border border-gray-700">
									<button type="button" onClick={() => setKeyAlgorithm('RSA')} className={`px-4 py-2 text-sm font-medium rounded-l-md flex-1 ${keyAlgorithm === 'RSA' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>RSA</button>
									<button type="button" onClick={() => setKeyAlgorithm('EC')} className={`px-4 py-2 text-sm font-medium rounded-r-md flex-1 ${keyAlgorithm === 'EC' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>ECDSA</button>
								</div>
								<div className="mt-2">
									{keyAlgorithm === 'RSA' ? (
										<select value={rsaKeySize} onChange={(e) => setRsaKeySize(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-white">
											{RSA_KEY_SIZES.map(s => <option key={s} value={s}>{s}-bit</option>)}
										</select>
									) : (
										<select value={ecCurve} onChange={(e) => setEcCurve(e.target.value as 'P-256' | 'P-384')} className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-white">
											{EC_CURVES.map(c => <option key={c} value={c}>{c}</option>)}
										</select>
									)}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Key Usage</label>
								<CheckboxGrid options={KEY_USAGE_FLAGS} selected={keyUsage} onChange={setKeyUsage} />
							</div>

							<div>
								{/* FIX: The TagInput component requires a 'label' prop.
                        The manual <label> and <p> tags were removed and the label was passed as a prop for consistency. */}
								<TagInput
									label="Extended Key Usages"
									values={extendedKeyUsage}
									setValues={setExtendedKeyUsage}
									placeholder="Add EKU OID or select from list"
									datalistId="eku-options"
								/>
								<datalist id="eku-options">
									{EKU_OPTIONS.map(opt => <option key={opt.oid} value={opt.oid}>{opt.name}</option>)}
								</datalist>
							</div>
						</div>
					</Section>

					<Section title="Private Key Security" description="Optionally encrypt the private key with a passphrase.">
						<Input
							label="Passphrase (optional)"
							type="password"
							name="passphrase"
							value={passphrase}
							onChange={(e) => setPassphrase(e.target.value)}
							placeholder="Enter a strong passphrase"
						/>
					</Section>

					<div className="pt-4 flex flex-col items-center">
						<button
							onClick={handleGenerate}
							disabled={isLoading}
							className="w-full max-w-xs inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:bg-blue-800 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Generating...
								</>
							) : 'Generate CSR'}
						</button>
						{error && <p className="mt-4 text-sm text-red-400">{error}</p>}
					</div>

					{(csr || privateKey) && (
						<OutputSection csr={csr} privateKey={privateKey} />
					)}

				</main>
			</div>
		</div>
	);
}