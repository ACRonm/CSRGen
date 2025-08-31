import { CsrWorkerRequest } from '../types';
import { generateKeypair } from '../crypto/keygen';
import { buildCSR } from '../crypto/csr';
import { encryptPkcs8 } from '../crypto/encryption';
import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import * as pvtsutils from 'pvtsutils';
import * as forge from 'node-forge';

(self as any).pkijs = pkijs;
(self as any).asn1js = asn1js;
(self as any).pvtsutils = pvtsutils;
(self as any).forge = forge;

self.onmessage = async (ev: MessageEvent<{ req: CsrWorkerRequest }>) => {
  const { req } = ev.data;

  try {
    const keyPair = await generateKeypair(req.key.algorithm, req.key.params);
    
    const { csrPem, privateKeyPem, privateKeyDer } = await buildCSR({
      subject: req.subject,
      san: req.san,
      ku: req.ku,
      eku: req.eku,
      bc: req.bc,
      keyPair
    });

    let finalKeyPem = privateKeyPem;
    if (req.encryptPass && req.encryptPass.length > 0) {
      finalKeyPem = encryptPkcs8(privateKeyDer, req.encryptPass);
    }

    self.postMessage({ ok: true, csrPem, keyPem: finalKeyPem });
  } catch (e: any) {
    self.postMessage({ ok: false, error: e?.message || String(e) });
  }
};