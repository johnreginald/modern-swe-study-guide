## ရက်သတ္တပတ် 4 — သင့်ထံမှ ကိုယ်စားလှယ် (Agent) နှင့် ရီပို (Repository) ကို စိတ်ကြိုက်ပြင်ဆင်ခြင်း

**အဓိကအချက်:** ⟦C223⟧ နှင့် ⟦C224⟧၊ မည်သည့်အရာကို မည်သည့်နေရာတွင် ထည့်သွင်းရမည်နည်း၊ လင့် (lint) စစ်ဆေးမှုများ၊ စမ်းသပ်မှု (test) ပတ်မှုများ နှင့် ဘေးကင်းလုံခြုံရေး ထိန်းကွပ်ချက် (guardrail) များအတွက် ဟွတ် (hook) များ၊ လက်အောက်ခံ ကိုယ်စားလှယ် (subagent) ပုံစံများ (စီစဉ်သူ / အကောင်အထည်ဖော်သူ / စစ်ဆေးသူ)။

### အခြေခံကျသော သင်ခန်းစာ (Core material) (≈ 3 h 40 min)

1. **ဆောင်းပါး:** Anthropic, [Claude Code best practices⟦U73⟧ (30 min) — ⟦C225⟧၊ ကိရိယာ ခွင့်ပြုစာရင်း (allowlist) များ၊ လုပ်ငန်းစဉ် (workflow) များ နှင့် မော်ဒယ် (model) တစ်ခုထက်မကသုံးသော Claude ပုံစံများအကြောင်း တရားဝင် လမ်းညွှန်ချက်။
2. **ဆောင်းပါး:** Anthropic, [Steering Claude Code: skills, hooks, rules, subagents, and more⟦U74⟧ (15 min) — နည်းလမ်းတစ်ခုချင်းစီကို မည်သည့်အချိန်တွင် အသုံးပြုရမည်နည်း။
3. **သင်ခန်းစာများ:** Hugging Face, [Sub-agents⟦U75⟧ နှင့် [Hooks⟦U76⟧ (≈ 90 min)။
4. **ဗီဒီယို:** Anthropic, [Mastering Claude Code in 30 minutes⟦U77⟧ (28 min) — စိတ်ကြိုက်ပြင်ဆင်မှုစနစ်များအကြောင်း Boris Cherny ၏ ကိုယ်တိုင် ရှင်းလင်းပြသမှု။
5. **ဗီဒီယို:** Boris Cherny, [Inside Claude Code With Its Creator⟦U78⟧ (50 min) — တာမီနယ် ဒီဇိုင်း၊ ⟦C226⟧၊ အဖွဲ့များ၊ လက်အောက်ခံ ကိုယ်စားလှယ်များ၊ အစီအစဉ် (plan) မုဒ် နှင့် ဆော့ဖ်ဝဲရေးသားခြင်း၏ အနာဂတ်။

### ကိရိယာ (Tool) များနှင့် ကိုးကားချက်များ

- Claude Code စာရွက်စာတမ်းများ: [Hooks reference⟦U79⟧ နှင့် [Create custom subagents⟦U80⟧ — သင် ရေးသားပြင်ဆင်ရန် လိုအပ်မည့် အတိအကျ ဖြစ်ရပ်အမည်များ၊ စာသားကိုက်ညီမှုစစ်ဆေးသည့် ကိရိယာများ နှင့် ဖိုင်အစပိုင်း အချက်အလက်များ။
- ရီပို ညွှန်ကြားချက် ဖိုင်များ: GitHub, [How to write a great agents.md: lessons from over 2,500 repositories⟦U81⟧; Real Python, [How to Write an AGENTS.md File⟦U82⟧; Agentic AI Foundation, [Writing an Effective AGENTS.md⟦U83⟧။
- လက်အောက်ခံ ကိုယ်စားလှယ် အငြင်းပွားဖွယ်ရာ အယူအဆများ: Cognition, [Don't Build Multi-Agents⟦U84⟧ နှင့် Anthropic, [How we built our multi-agent research system⟦U85⟧။ သင့် အခန်းကဏ္ဍ ၃ ခုကို မဒီဇိုင်းထုတ်မီ နှစ်ခုလုံးကို ဖတ်ရှုပါ။
- Anthropic, [How Anthropic teams use Claude Code⟦U86⟧ — အဖွဲ့လိုက် အတွင်းပိုင်း လက်ခံအသုံးပြုမှု (adoption) ပုံစံများ။
- အခမဲ့ သင်တန်းများ: Anthropic Academy, [Claude Code in Action⟦U87⟧; DeepLearning.AI, [Claude Code: A Highly Agentic Coding Assistant⟦U88⟧။
