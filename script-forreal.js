(function () {
  const outputEl = document.getElementById('terminal-output');
  const inputEl = document.getElementById('terminal-input');

  // Base64 fragments scattered in the HTML code
  const FRAGMENTS = [
    'ZmxhZw==',      // "flag" - in hidden-data-1
    'e2hhc2hfczNf',  // "flag{s3_" - in hidden-data-2  
    'YnVpbGRpbmc=',  // "building" - in hidden-data-3
    'X3VuaXR5fQ=='   // "_unity}" - in hidden-data-4
  ];

  // Correct order: [0,1,2,3] -> flag + flag{s3_ + building + _unity} = flagflag{s3_building_unity}
  const CORRECT_ORDER = [0, 1, 2, 3];

  // Progressive hints system
  const HINTS = {
    1: "This is the real mission control. Look deeper.",
    2: "Mission exploit reveals that flag is in fragments.",
    3: "Inspect the page source to find the fragments."
  };

  let hintLevel = 0;
  let fragmentsFound = 0;

  const COMMANDS = {
    help: {
      description: 'List available commands',
      run: () => {
        printLine('available commands:', 'hint');
        printLine('- status          # check system status');
        printLine('- missions        # list classified missions');
        printLine('- missionexploit  # execute mission exploit');
        printLine('- hint            # get progressive hints');
        printLine('- clear           # clear the console');
        printLine('- whoami          # check current user');
      },
    },

    status: {
      description: 'Check system status',
      run: () => {
        printLine('authentic system status check...');
        delay(800).then(() => {
          printLine('✓ encryption: QUANTUM-256 active', 'success');
          printLine('✓ firewall: maximum protection', 'success');
          printLine('⚠ intrusion: DETECTED', 'warning');
          printLine('✗ threat level: CRITICAL', 'danger');
          printLine('', 'hint');
          printLine('system: AUTHENTIC MISSION CONTROL', 'hint');
        });
      },
    },

    missions: {
      description: 'List classified missions',
      run: () => {
        printLine('accessing classified mission database...');
        delay(600).then(() => {
          printLine('OP-ALPHA: CLASSIFIED', 'success');
          printLine('OP-BETA: CLASSIFIED', 'warning');
          printLine('OP-GAMMA: CLASSIFIED', 'hint');
          printLine('OP-DELTA: CLASSIFIED', 'hint');
          printLine('', 'hint');
          printLine('access level: ELEVATED - full information', 'hint');
        });
      },
    },

    missionexploit: {
      description: 'Execute mission exploit',
      run: () => {
        printLine('executing authentic mission exploit...');
        delay(1200).then(() => {
          printLine('access granted: authentic mission payload', 'warn');
          printLine('mission exploit successful', 'success');
          printLine('', 'hint');
          printLine('🔍 HINT: Flag is in fragments', 'hint');
        });
      },
    },

    whoami: {
      description: 'Check current user',
      run: () => {
        printLine('current user: admin', 'hint');
        printLine('access level: elevated', 'hint');
        printLine('permissions: full access', 'hint');
        printLine('session: admin@for-real', 'hint');
      },
    },

    hint: {
      description: 'Get progressive hints',
      run: () => {
        hintLevel++;
        if (hintLevel <= 3) {
          printLine(`H${hintLevel}: ${HINTS[hintLevel]}`, 'hint');
          if (hintLevel === 3) {
            printLine('(penalized hint - final level reached)', 'warn');
            printLine('', 'hint');
            printLine('🔍 FINAL HINT: Right-click → View Page Source', 'hint');
            printLine('🔍 FINAL HINT: Search for "hidden-data"', 'hint');
            printLine('🔍 FINAL HINT: Find Base64 strings in comments', 'hint');
          }
        } else {
          printLine('no more hints available', 'warn');
        }
      },
    },

    clear: {
      description: 'Clear output',
      run: () => (outputEl.innerHTML = ''),
    },
  };

  function printLine(text, cls) {
    const line = document.createElement('div');
    line.className = `line${cls ? ' ' + cls : ''}`;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function boot() {
    const banner = [
      'authentic mission control initialized',
      `system: v${(Math.random() * 3 + 1).toFixed(2)}  arch:x64`,
      'encryption: QUANTUM-256/TLS13  firewall: maximum',
      'threat level: CRITICAL',
      '',
      '🚨 AUTHENTIC SYSTEM - ELEVATED ACCESS',
      'type "help" for available commands',
    ];
    let t = 200;
    banner.forEach((line) => {
      t += 220;
      setTimeout(() => printLine(line), t);
    });
    inputEl.focus();
  }

  function handleCommand(raw) {
    const input = String(raw || '').trim();
    if (!input) return;
    printLine(`admin@for-real:~$ ${input}`);

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (COMMANDS[cmd]) {
      COMMANDS[cmd].run(args);
      return;
    }

    const noise = [
      'command not recognized in elevated mode.',
      'access denied. insufficient clearance.',
      'security violation detected. command blocked.',
      'unknown directive. type "help" for assistance.',
    ];
    const msg = noise[Math.floor(Math.random() * noise.length)];
    printLine(msg, 'err');
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputEl.value);
      inputEl.value = '';
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      COMMANDS.clear.run();
    }
  });

  document.querySelector('.terminal').addEventListener('click', () => inputEl.focus());

  // Boot
  boot();
})();
