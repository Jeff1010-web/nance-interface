// Override console.debug
// Don't print console.debug messages in production
const _console = {
  debug: (...args: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEBUG]", ...args);
    }
  },
};

console.debug = _console.debug;

export default _console;
