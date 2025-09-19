// Ordering VM - computes fragment permutation algorithm
// This is a tiny VM that implements a permutation algorithm
// Players must run this with page inputs to get candidate_order

class OrderingVM {
  constructor() {
    this.memory = new Array(256).fill(0);
    this.registers = { a: 0, b: 0, c: 0, d: 0 };
    this.stack = [];
    this.pc = 0; // program counter
    this.halted = false;
  }

  // VM instructions
  instructions = {
    LOAD: (addr) => {
      this.registers.a = this.memory[addr] || 0;
      this.pc++;
    },
    STORE: (addr) => {
      this.memory[addr] = this.registers.a;
      this.pc++;
    },
    ADD: (val) => {
      this.registers.a += val;
      this.pc++;
    },
    MUL: (val) => {
      this.registers.a *= val;
      this.pc++;
    },
    XOR: (val) => {
      this.registers.a ^= val;
      this.pc++;
    },
    SHIFT: (val) => {
      this.registers.a = (this.registers.a << val) | (this.registers.a >>> (32 - val));
      this.pc++;
    },
    SWAP: () => {
      const temp = this.registers.b;
      this.registers.b = this.registers.a;
      this.registers.a = temp;
      this.pc++;
    },
    PUSH: () => {
      this.stack.push(this.registers.a);
      this.pc++;
    },
    POP: () => {
      this.registers.a = this.stack.pop() || 0;
      this.pc++;
    },
    HALT: () => {
      this.halted = true;
    }
  };

  // Load program into memory
  loadProgram(program) {
    program.forEach((instr, idx) => {
      this.memory[idx] = instr;
    });
  }

  // Execute the VM
  execute() {
    while (!this.halted && this.pc < this.memory.length) {
      const instruction = this.memory[this.pc];
      if (instruction && this.instructions[instruction.op]) {
        this.instructions[instruction.op](instruction.arg);
      } else {
        this.pc++;
      }
    }
    return this.registers.a;
  }

  // Reset VM state
  reset() {
    this.memory.fill(0);
    this.registers = { a: 0, b: 0, c: 0, d: 0 };
    this.stack = [];
    this.pc = 0;
    this.halted = false;
  }
}

// Fragment ordering algorithm
function computeFragmentOrder(fragments) {
  const vm = new OrderingVM();
  
  // Initialize memory with fragment data
  const fragmentData = fragments.map(f => {
    // Convert base64 to numeric representation
    let hash = 0;
    for (let i = 0; i < f.length; i++) {
      hash = ((hash << 5) - hash + f.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
  });

  // Load fragment hashes into memory
  fragmentData.forEach((hash, idx) => {
    vm.memory[idx * 4] = (hash >> 24) & 0xff;
    vm.memory[idx * 4 + 1] = (hash >> 16) & 0xff;
    vm.memory[idx * 4 + 2] = (hash >> 8) & 0xff;
    vm.memory[idx * 4 + 3] = hash & 0xff;
  });

  // Load permutation algorithm
  const program = [
    { op: 'LOAD', arg: 0 },
    { op: 'XOR', arg: 0x5A },
    { op: 'SHIFT', arg: 3 },
    { op: 'STORE', arg: 64 },
    
    { op: 'LOAD', arg: 4 },
    { op: 'XOR', arg: 0xA5 },
    { op: 'SHIFT', arg: 5 },
    { op: 'ADD', arg: 0x1234 },
    { op: 'STORE', arg: 65 },
    
    { op: 'LOAD', arg: 8 },
    { op: 'XOR', arg: 0xF0 },
    { op: 'SHIFT', arg: 7 },
    { op: 'ADD', arg: 0x5678 },
    { op: 'STORE', arg: 66 },
    
    { op: 'LOAD', arg: 12 },
    { op: 'XOR', arg: 0x0F },
    { op: 'SHIFT', arg: 1 },
    { op: 'ADD', arg: 0x9ABC },
    { op: 'STORE', arg: 67 },
    
    { op: 'LOAD', arg: 64 },
    { op: 'XOR', arg: 0x42 },
    { op: 'MUL', arg: 3 },
    { op: 'PUSH' },
    
    { op: 'LOAD', arg: 65 },
    { op: 'XOR', arg: 0x24 },
    { op: 'MUL', arg: 7 },
    { op: 'PUSH' },
    
    { op: 'LOAD', arg: 66 },
    { op: 'XOR', arg: 0x84 },
    { op: 'MUL', arg: 11 },
    { op: 'PUSH' },
    
    { op: 'LOAD', arg: 67 },
    { op: 'XOR', arg: 0x48 },
    { op: 'MUL', arg: 13 },
    { op: 'PUSH' },
    
    { op: 'HALT' }
  ];

  vm.loadProgram(program);
  vm.execute();

  // Extract computed values from stack
  const values = [];
  while (vm.stack.length > 0) {
    values.unshift(vm.stack.pop());
  }

  // Compute permutation order based on computed values
  const sortedPairs = values.map((val, idx) => ({ val, idx }))
    .sort((a, b) => a.val - b.val);
  
  return sortedPairs.map(pair => pair.idx);
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.OrderingVM = OrderingVM;
  window.computeFragmentOrder = computeFragmentOrder;
}
