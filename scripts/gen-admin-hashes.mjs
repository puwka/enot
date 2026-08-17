import { webcrypto } from 'crypto';

const enc = new TextEncoder();

async function hashPassword(password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await webcrypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const hash = new Uint8Array(bits);
  const b64 = (u8) => Buffer.from(u8).toString('base64');
  return ['pbkdf2', '100000', b64(salt), b64(hash)].join('$');
}

async function verify(password, stored) {
  const parts = stored.split('$');
  const iterations = Number(parts[1]);
  const salt = Buffer.from(parts[2], 'base64');
  const expected = Buffer.from(parts[3], 'base64');
  const key = await webcrypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8
  );
  return Buffer.from(bits).equals(expected);
}

const passwords = ['SuperAdmin123!', 'Admin123!', 'Editor123!'];
for (const password of passwords) {
  const hashed = await hashPassword(password);
  const ok = await verify(password, hashed);
  console.log(JSON.stringify({ password, hashed, ok }));
}
