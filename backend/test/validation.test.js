import test from 'node:test';import assert from 'node:assert/strict';import {emailSchema,passwordSchema,registerSchema,messageSchema,safeDisplayName} from '../src/validation.js';
test('normalizes email to lowercase',()=>assert.equal(emailSchema.parse(' PERSON@Example.com '),'person@example.com'));
test('rejects malformed email',()=>assert.equal(emailSchema.safeParse('not-an-email').success,false));
test('requires longer passwords',()=>{assert.equal(passwordSchema.safeParse('short').success,false);assert.equal(passwordSchema.safeParse('long-enough-password').success,true)});
test('rejects unexpected registration fields',()=>{const v={email:'a@example.com',password:'long-enough-password',displayName:'A'};assert.equal(registerSchema.safeParse(v).success,true);assert.equal(registerSchema.safeParse({...v,admin:true}).success,false)});
test('trims and validates messages',()=>{assert.equal(messageSchema.parse({content:' Hello '}).content,'Hello');assert.equal(messageSchema.safeParse({content:'  '}).success,false)});
test('sanitizes display names and limits length',()=>{assert.equal(safeDisplayName('<b>Creator</b>'),'bCreator/b');assert.equal(safeDisplayName('x'.repeat(80)).length,60)});
