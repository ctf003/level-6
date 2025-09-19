(function () {
  const outputEl = document.getElementById('terminal-output');
  const inputEl = document.getElementById('terminal-input');

  // MD5 hash that decodes to reveal the hint about /For Real
  const MISSION_MD5 = '134f554d33350e632942044032509562';

  // Progressive hints system
  const HINTS = {
    1: "This is a classified system. Look for hidden paths.",
    2: "Mission exploit reveals an MD5 hash - decode it.",
    3: "MD5 decoders are available online - try them."
  };

  let hintLevel = 0;

  const COMMANDS = {
    help: {
      description: 'List available commands',
      run: () => {
        printLine('available commands:', 'hint');
        printLine('- status          # check system status');
        printLine('- missions        # list active missions');
        printLine('- missionexploit  # execute mission exploit');
        printLine('- hint            # get progressive hints');
        printLine('- clear           # clear the console');
        printLine('- whoami          # check current user');
      },
    },

    status: {
      description: 'Check system status',
      run: () => {
        printLine('system status check...');
        delay(800).then(() => {
          printLine('✓ encryption: AES-256 active', 'success');
          printLine('✓ firewall: protected', 'success');
          printLine('⚠ intrusion: monitoring', 'warning');
          printLine('✗ threat level: ELEVATED', 'danger');
        });
      },
    },

    missions: {
      description: 'List active missions',
      run: () => {
        printLine('accessing mission database...');
        delay(600).then(() => {
          printLine('OP-001: COMPLETED', 'success');
          printLine('OP-002: IN PROGRESS', 'warning');
          printLine('OP-003: PENDING', 'hint');
          printLine('', 'hint');
          printLine('access level: GUEST - limited information', 'hint');
        });
      },
    },

    missionexploit: {
      description: 'Execute mission exploit',
      run: () => {
        printLine('initializing mission exploit protocol...');
        delay(1000).then(() => {
          printLine('access granted: mission payload', 'warn');
          printLine(`HASH: ${MISSION_MD5}`, 'hash');
          printLine('MD5 revealed — decode it to find the real mission.', 'warn');
        });
      },
    },

    whoami: {
      description: 'Check current user',
      run: () => {
        printLine('current user: guest', 'hint');
        printLine('access level: limited', 'hint');
        printLine('permissions: read-only', 'hint');
        printLine('session: guest@secure-ops', 'hint');
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
      'secure operations center initialized',
      `system: v${(Math.random() * 3 + 1).toFixed(2)}  arch:x64`,
      'encryption: AES-256/TLS13  firewall: active',
      'threat level: ELEVATED',
      '',
      '⚠️  CLASSIFIED SYSTEM - GUEST ACCESS ONLY',
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
    printLine(`guest@secure-ops:~$ ${input}`);

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (COMMANDS[cmd]) {
      COMMANDS[cmd].run(args);
      return;
    }

    const noise = [
      'access denied. insufficient privileges.',
      'unknown command. type "help" for assistance.',
      'command not recognized in guest mode.',
      'security violation detected. command blocked.',
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