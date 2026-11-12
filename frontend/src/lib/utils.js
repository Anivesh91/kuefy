/**
 * Helper to combine class names conditionally (shadcn utility)
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default cn;
