/**
 * IDL Filter Utility for Smart City OS
 * Removes problematic tuple types from IDL to enable Anchor program initialization
 */

function filterIDL(originalIDL) {
  // Clone the IDL
  const filteredIDL = JSON.parse(JSON.stringify(originalIDL));
  
  // Filter out instructions that use tuple types
  filteredIDL.instructions = filteredIDL.instructions.filter(instruction => {
    // Check if any args use tuple types
    const hasTupleTypes = instruction.args.some(arg => {
      if (typeof arg.type === 'object' && arg.type.vec) {
        return typeof arg.type.vec.defined === 'string' && arg.type.vec.defined.includes('(');
      }
      return false;
    });
    
    if (hasTupleTypes) {
      console.log(`⚠️ Filtering out instruction '${instruction.name}' due to tuple types`);
      return false;
    }
    
    return true;
  });
  
  return filteredIDL;
}

module.exports = { filterIDL };