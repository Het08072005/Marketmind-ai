const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('frontend/src/hooks/useVoiceAgent.js', 'utf8');
const start = source.indexOf('    const SpeechRecognition =');
const end = source.indexOf('\n  }, [language, stopAudioPlayback]);', start);
function harness() {
  let now = 10000, next = 0;
  const timers = new Map(), submitted = [];
  const ctx = { language: 'english', console,
    window: { SpeechRecognition: class { start() { this.onstart?.(); } abort() {} } },
    Date: { now: () => now }, setLiveTranscript() {}, stopAudioPlayback() {},
    setTimeout(fn, ms) { timers.set(++next, { at: now + ms, fn }); return next; },
    clearTimeout(id) { timers.delete(id); },
  };
  for (const [key, value] of Object.entries({silenceTimerRef:null, transcriptRef:'', isMicMutedRef:false, isPlayingAudioRef:false, isSubmittingRef:false, isListeningRef:true, echoCooldownUntilRef:0, lastSpokenTextRef:'', recognitionRef:null})) ctx[key] = {current:value};
  ctx.submitQueryRef = {current: text => { submitted.push(text); ctx.isSubmittingRef.current = true; }};
  vm.runInNewContext(`(function(){${source.slice(start,end)}\n})()`,ctx);
  const rec = ctx.recognitionRef.current;
  rec.start();
  return { ctx, rec, submitted,
    result(text, final) { rec.onresult({results:[Object.assign([{transcript:text}], {isFinal:final})]}); },
    tick(ms) { now += ms; for (const [id,t] of [...timers]) if(t.at <= now) { timers.delete(id); t.fn(); } }
  };
}
test('interim speech is never submitted, even after a long pause', () => {
  const h = harness(); h.result('compare adani', false); h.tick(10000); assert.deepEqual(h.submitted, []);
  h.result('compare adani and reliance', true); h.tick(2199); assert.deepEqual(h.submitted, []);
  h.tick(1); assert.deepEqual(h.submitted, ['compare adani and reliance']);
});
test('speech resumption cancels pending turn and restart preserves earlier words', () => {
  const h = harness(); h.result('compare adani', true); h.tick(1500); h.rec.onspeechstart(); h.tick(1000);
  assert.deepEqual(h.submitted, []); h.rec.onend(); h.result('and reliance', true); h.tick(2200);
  assert.deepEqual(h.submitted, ['compare adani and reliance']);
});
test('wake prefix gets the same pause allowance and mute blocks submission', () => {
  const h = harness(); h.result('Hey Alex', true); h.tick(300); assert.deepEqual(h.submitted, []);
  h.result('Hey Alex compare TCS and Infosys', true); h.ctx.isMicMutedRef.current = true; h.tick(2200);
  assert.deepEqual(h.submitted, []);
});
