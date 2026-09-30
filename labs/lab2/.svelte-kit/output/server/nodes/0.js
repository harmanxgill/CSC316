

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DF7Z67zA.js","_app/immutable/chunks/CgM0eQFd.js","_app/immutable/chunks/xihTtKlq.js"];
export const stylesheets = [];
export const fonts = [];
