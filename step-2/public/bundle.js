function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
}
function select_options(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        option.selected = ~value.indexOf(option.__value);
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

var states = [
    "AK",
    "AL",
    "AR",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "WA",
    "WI",
    "WV",
    "WY"
];

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

function local(key, initial) {
    const toString = (value) => JSON.stringify(value, null, 2); // helper function
    const toObj = JSON.parse; // helper function
    if (localStorage) {
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, toString(initial));
        }
        const saved = toObj(localStorage.getItem(key) || '');
        const store = writable(saved);
        return {
            subscribe: store.subscribe,
            set: (value) => {
                localStorage.setItem(key, toString(value));
                store.set(value);
            },
            update: (fn) => {
                store.update(fn);
                localStorage.setItem(key, toString(get_store_value(store)));
            }
        };
    }
    else {
        return writable(initial);
    }
}

/* src/components/Form.svelte generated by Svelte v3.29.7 */
const file = "src/components/Form.svelte";
const get_default_slot_changes = dirty => ({});
const get_default_slot_context = ctx => ({ store: /*store*/ ctx[0] });

function create_fragment(ctx) {
	let form;
	let t0;
	let br;
	let t1;
	let input;
	let current;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);
	let form_levels = [/*$$restProps*/ ctx[1]];
	let form_data = {};

	for (let i = 0; i < form_levels.length; i += 1) {
		form_data = assign(form_data, form_levels[i]);
	}

	const block = {
		c: function create() {
			form = element("form");
			if (default_slot) default_slot.c();
			t0 = space();
			br = element("br");
			t1 = space();
			input = element("input");
			add_location(br, file, 9, 1, 250);
			attr_dev(input, "type", "submit");
			attr_dev(input, "placeholder", "Submit");
			add_location(input, file, 11, 1, 259);
			set_attributes(form, form_data);
			add_location(form, file, 6, 0, 206);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, form, anchor);

			if (default_slot) {
				default_slot.m(form, null);
			}

			append_dev(form, t0);
			append_dev(form, br);
			append_dev(form, t1);
			append_dev(form, input);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 8) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}

			set_attributes(form, form_data = get_spread_update(form_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(form);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	const omit_props_names = ["name"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Form", slots, ['default']);
	let { name } = $$props;
	const store = name !== undefined ? local(name, {}) : writable({});

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("name" in $$new_props) $$invalidate(2, name = $$new_props.name);
		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({ writable, local, name, store });

	$$self.$inject_state = $$new_props => {
		if ("name" in $$props) $$invalidate(2, name = $$new_props.name);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [store, $$restProps, name, $$scope, slots];
}

class Form extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { name: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Form",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
			console.warn("<Form> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Input.svelte generated by Svelte v3.29.7 */

const file$1 = "src/components/Input.svelte";

function create_fragment$1(ctx) {
	let input;
	let mounted;
	let dispose;
	let input_levels = [{ name: /*name*/ ctx[0] }, /*$$restProps*/ ctx[3]];
	let input_data = {};

	for (let i = 0; i < input_levels.length; i += 1) {
		input_data = assign(input_data, input_levels[i]);
	}

	const block = {
		c: function create() {
			input = element("input");
			set_attributes(input, input_data);
			add_location(input, file$1, 17, 0, 309);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, input, anchor);
			set_input_value(input, /*value*/ ctx[1]);

			if (!mounted) {
				dispose = [
					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
					listen_dev(input, "input", /*ourInput*/ ctx[2], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			set_attributes(input, input_data = get_spread_update(input_levels, [
				dirty & /*name*/ 1 && { name: /*name*/ ctx[0] },
				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
			]));

			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
				set_input_value(input, /*value*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(input);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	const omit_props_names = ["store","name","onInput"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Input", slots, []);
	
	let { store } = $$props;
	let { name } = $$props;
	let { onInput = null } = $$props;
	let value;
	store.subscribe(v => $$invalidate(1, value = v[name]));

	const ourInput = e => {
		store.update(v => {
			v[name] = value;
			return v;
		});

		if (onInput) {
			onInput(e);
		}
	};

	function input_input_handler() {
		value = this.value;
		$$invalidate(1, value);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("store" in $$new_props) $$invalidate(4, store = $$new_props.store);
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ("onInput" in $$new_props) $$invalidate(5, onInput = $$new_props.onInput);
	};

	$$self.$capture_state = () => ({ store, name, onInput, value, ourInput });

	$$self.$inject_state = $$new_props => {
		if ("store" in $$props) $$invalidate(4, store = $$new_props.store);
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
		if ("onInput" in $$props) $$invalidate(5, onInput = $$new_props.onInput);
		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [name, value, ourInput, $$restProps, store, onInput, input_input_handler];
}

class Input extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { store: 4, name: 0, onInput: 5 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*store*/ ctx[4] === undefined && !("store" in props)) {
			console.warn("<Input> was created without expected prop 'store'");
		}

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<Input> was created without expected prop 'name'");
		}
	}

	get store() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set store(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get name() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get onInput() {
		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set onInput(value) {
		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Select.svelte generated by Svelte v3.29.7 */

const file$2 = "src/components/Select.svelte";

function create_fragment$2(ctx) {
	let select;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
	let select_levels = [{ name: /*name*/ ctx[0] }, /*$$restProps*/ ctx[3]];
	let select_data = {};

	for (let i = 0; i < select_levels.length; i += 1) {
		select_data = assign(select_data, select_levels[i]);
	}

	const block = {
		c: function create() {
			select = element("select");
			if (default_slot) default_slot.c();
			set_attributes(select, select_data);
			if (/*value*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
			add_location(select, file$2, 18, 0, 330);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, select, anchor);

			if (default_slot) {
				default_slot.m(select, null);
			}

			if (select_data.multiple) select_options(select, select_data.value);
			select_option(select, /*value*/ ctx[1]);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(select, "change", /*select_change_handler*/ ctx[8]),
					listen_dev(select, "blur", /*ourChange*/ ctx[2], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 64) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
				}
			}

			set_attributes(select, select_data = get_spread_update(select_levels, [
				(!current || dirty & /*name*/ 1) && { name: /*name*/ ctx[0] },
				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
			]));

			if (dirty & /*name, $$restProps*/ 9 && select_data.multiple) select_options(select, select_data.value);

			if (dirty & /*value*/ 2) {
				select_option(select, /*value*/ ctx[1]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(select);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	const omit_props_names = ["store","name","onChange"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Select", slots, ['default']);
	
	let { store } = $$props;
	let { name } = $$props;
	let { onChange = null } = $$props;
	let value;
	store.subscribe(v => $$invalidate(1, value = v[name]));

	const ourChange = e => {
		store.update(v => {
			v[name] = value;
			return v;
		});

		if (onChange) {
			onChange(e);
		}
	};

	function select_change_handler() {
		value = select_value(this);
		$$invalidate(1, value);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("store" in $$new_props) $$invalidate(4, store = $$new_props.store);
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ("onChange" in $$new_props) $$invalidate(5, onChange = $$new_props.onChange);
		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({ store, name, onChange, value, ourChange });

	$$self.$inject_state = $$new_props => {
		if ("store" in $$props) $$invalidate(4, store = $$new_props.store);
		if ("name" in $$props) $$invalidate(0, name = $$new_props.name);
		if ("onChange" in $$props) $$invalidate(5, onChange = $$new_props.onChange);
		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		name,
		value,
		ourChange,
		$$restProps,
		store,
		onChange,
		$$scope,
		slots,
		select_change_handler
	];
}

class Select extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { store: 4, name: 0, onChange: 5 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Select",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*store*/ ctx[4] === undefined && !("store" in props)) {
			console.warn("<Select> was created without expected prop 'store'");
		}

		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
			console.warn("<Select> was created without expected prop 'name'");
		}
	}

	get store() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set store(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get name() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get onChange() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set onChange(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.29.7 */
const file$3 = "src/App.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i];
	return child_ctx;
}

// (25:6) {#each states as state}
function create_each_block_1(ctx) {
	let option;
	let t_value = /*state*/ ctx[1] + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*state*/ ctx[1];
			option.value = option.__value;
			add_location(option, file$3, 25, 8, 953);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(25:6) {#each states as state}",
		ctx
	});

	return block;
}

// (22:4) <Select {store} name="ship_state">
function create_default_slot_2(ctx) {
	let option;
	let t1;
	let each_1_anchor;
	let each_value_1 = states;
	validate_each_argument(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = "State";
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			option.__value = "State";
			option.value = option.__value;
			add_location(option, file$3, 22, 6, 891);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			insert_dev(target, t1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*states*/ 0) {
				each_value_1 = states;
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
			if (detaching) detach_dev(t1);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(22:4) <Select {store} name=\\\"ship_state\\\">",
		ctx
	});

	return block;
}

// (39:6) {#each states as state}
function create_each_block(ctx) {
	let option;
	let t_value = /*state*/ ctx[1] + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*state*/ ctx[1];
			option.value = option.__value;
			add_location(option, file$3, 39, 8, 1454);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(39:6) {#each states as state}",
		ctx
	});

	return block;
}

// (36:4) <Select {store} name="bill_state">
function create_default_slot_1(ctx) {
	let option;
	let t1;
	let each_1_anchor;
	let each_value = states;
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = "State";
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			option.__value = "State";
			option.value = option.__value;
			add_location(option, file$3, 36, 6, 1392);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			insert_dev(target, t1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*states*/ 0) {
				each_value = states;
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
			if (detaching) detach_dev(t1);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(36:4) <Select {store} name=\\\"bill_state\\\">",
		ctx
	});

	return block;
}

// (9:1) <Form {name} let:store>
function create_default_slot(ctx) {
	let h20;
	let t1;
	let input0;
	let t2;
	let input1;
	let t3;
	let input2;
	let t4;
	let input3;
	let t5;
	let h21;
	let t7;
	let input4;
	let t8;
	let input5;
	let t9;
	let input6;
	let t10;
	let select0;
	let t11;
	let input7;
	let t12;
	let h22;
	let t14;
	let input8;
	let t15;
	let input9;
	let t16;
	let input10;
	let t17;
	let select1;
	let t18;
	let input11;
	let t19;
	let h23;
	let t21;
	let input12;
	let t22;
	let input13;
	let t23;
	let input14;
	let t24;
	let input15;
	let t25;
	let input16;
	let current;

	input0 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "first_name",
				placeholder: "First Name"
			},
			$$inline: true
		});

	input1 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "last_name",
				placeholder: "Last Name"
			},
			$$inline: true
		});

	input2 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "phone",
				placeholder: "Phone Number"
			},
			$$inline: true
		});

	input3 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "email",
				name: "email",
				placeholder: "Email"
			},
			$$inline: true
		});

	input4 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "ship_address",
				placeholder: "Address"
			},
			$$inline: true
		});

	input5 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "ship_address2",
				placeholder: "Address 2"
			},
			$$inline: true
		});

	input6 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "ship_city",
				placeholder: "City"
			},
			$$inline: true
		});

	select0 = new Select({
			props: {
				store: /*store*/ ctx[0],
				name: "ship_state",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	input7 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "ship_zip",
				placeholder: "Zip Code"
			},
			$$inline: true
		});

	input8 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "bill_address",
				placeholder: "Address"
			},
			$$inline: true
		});

	input9 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "bill_address2",
				placeholder: "Address 2"
			},
			$$inline: true
		});

	input10 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "bill_city",
				placeholder: "City"
			},
			$$inline: true
		});

	select1 = new Select({
			props: {
				store: /*store*/ ctx[0],
				name: "bill_state",
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	input11 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "bill_zip",
				placeholder: "Zip Code"
			},
			$$inline: true
		});

	input12 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "card",
				placeholder: "Card Number"
			},
			$$inline: true
		});

	input13 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "month",
				placeholder: "Month"
			},
			$$inline: true
		});

	input14 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "year",
				placeholder: "Year"
			},
			$$inline: true
		});

	input15 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "cvv",
				placeholder: "CVV"
			},
			$$inline: true
		});

	input16 = new Input({
			props: {
				store: /*store*/ ctx[0],
				type: "text",
				name: "card_zip",
				placeholder: "Zip Code (optional)"
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h20 = element("h2");
			h20.textContent = "Customer Info";
			t1 = space();
			create_component(input0.$$.fragment);
			t2 = space();
			create_component(input1.$$.fragment);
			t3 = space();
			create_component(input2.$$.fragment);
			t4 = space();
			create_component(input3.$$.fragment);
			t5 = space();
			h21 = element("h2");
			h21.textContent = "Billing Info";
			t7 = space();
			create_component(input4.$$.fragment);
			t8 = space();
			create_component(input5.$$.fragment);
			t9 = space();
			create_component(input6.$$.fragment);
			t10 = space();
			create_component(select0.$$.fragment);
			t11 = space();
			create_component(input7.$$.fragment);
			t12 = space();
			h22 = element("h2");
			h22.textContent = "Shipping Info";
			t14 = space();
			create_component(input8.$$.fragment);
			t15 = space();
			create_component(input9.$$.fragment);
			t16 = space();
			create_component(input10.$$.fragment);
			t17 = space();
			create_component(select1.$$.fragment);
			t18 = space();
			create_component(input11.$$.fragment);
			t19 = space();
			h23 = element("h2");
			h23.textContent = "Payment Info";
			t21 = space();
			create_component(input12.$$.fragment);
			t22 = space();
			create_component(input13.$$.fragment);
			t23 = space();
			create_component(input14.$$.fragment);
			t24 = space();
			create_component(input15.$$.fragment);
			t25 = space();
			create_component(input16.$$.fragment);
			add_location(h20, file$3, 9, 4, 275);
			add_location(h21, file$3, 16, 4, 598);
			add_location(h22, file$3, 30, 4, 1098);
			add_location(h23, file$3, 44, 4, 1599);
		},
		m: function mount(target, anchor) {
			insert_dev(target, h20, anchor);
			insert_dev(target, t1, anchor);
			mount_component(input0, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(input1, target, anchor);
			insert_dev(target, t3, anchor);
			mount_component(input2, target, anchor);
			insert_dev(target, t4, anchor);
			mount_component(input3, target, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, h21, anchor);
			insert_dev(target, t7, anchor);
			mount_component(input4, target, anchor);
			insert_dev(target, t8, anchor);
			mount_component(input5, target, anchor);
			insert_dev(target, t9, anchor);
			mount_component(input6, target, anchor);
			insert_dev(target, t10, anchor);
			mount_component(select0, target, anchor);
			insert_dev(target, t11, anchor);
			mount_component(input7, target, anchor);
			insert_dev(target, t12, anchor);
			insert_dev(target, h22, anchor);
			insert_dev(target, t14, anchor);
			mount_component(input8, target, anchor);
			insert_dev(target, t15, anchor);
			mount_component(input9, target, anchor);
			insert_dev(target, t16, anchor);
			mount_component(input10, target, anchor);
			insert_dev(target, t17, anchor);
			mount_component(select1, target, anchor);
			insert_dev(target, t18, anchor);
			mount_component(input11, target, anchor);
			insert_dev(target, t19, anchor);
			insert_dev(target, h23, anchor);
			insert_dev(target, t21, anchor);
			mount_component(input12, target, anchor);
			insert_dev(target, t22, anchor);
			mount_component(input13, target, anchor);
			insert_dev(target, t23, anchor);
			mount_component(input14, target, anchor);
			insert_dev(target, t24, anchor);
			mount_component(input15, target, anchor);
			insert_dev(target, t25, anchor);
			mount_component(input16, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const input0_changes = {};
			if (dirty & /*store*/ 1) input0_changes.store = /*store*/ ctx[0];
			input0.$set(input0_changes);
			const input1_changes = {};
			if (dirty & /*store*/ 1) input1_changes.store = /*store*/ ctx[0];
			input1.$set(input1_changes);
			const input2_changes = {};
			if (dirty & /*store*/ 1) input2_changes.store = /*store*/ ctx[0];
			input2.$set(input2_changes);
			const input3_changes = {};
			if (dirty & /*store*/ 1) input3_changes.store = /*store*/ ctx[0];
			input3.$set(input3_changes);
			const input4_changes = {};
			if (dirty & /*store*/ 1) input4_changes.store = /*store*/ ctx[0];
			input4.$set(input4_changes);
			const input5_changes = {};
			if (dirty & /*store*/ 1) input5_changes.store = /*store*/ ctx[0];
			input5.$set(input5_changes);
			const input6_changes = {};
			if (dirty & /*store*/ 1) input6_changes.store = /*store*/ ctx[0];
			input6.$set(input6_changes);
			const select0_changes = {};
			if (dirty & /*store*/ 1) select0_changes.store = /*store*/ ctx[0];

			if (dirty & /*$$scope*/ 64) {
				select0_changes.$$scope = { dirty, ctx };
			}

			select0.$set(select0_changes);
			const input7_changes = {};
			if (dirty & /*store*/ 1) input7_changes.store = /*store*/ ctx[0];
			input7.$set(input7_changes);
			const input8_changes = {};
			if (dirty & /*store*/ 1) input8_changes.store = /*store*/ ctx[0];
			input8.$set(input8_changes);
			const input9_changes = {};
			if (dirty & /*store*/ 1) input9_changes.store = /*store*/ ctx[0];
			input9.$set(input9_changes);
			const input10_changes = {};
			if (dirty & /*store*/ 1) input10_changes.store = /*store*/ ctx[0];
			input10.$set(input10_changes);
			const select1_changes = {};
			if (dirty & /*store*/ 1) select1_changes.store = /*store*/ ctx[0];

			if (dirty & /*$$scope*/ 64) {
				select1_changes.$$scope = { dirty, ctx };
			}

			select1.$set(select1_changes);
			const input11_changes = {};
			if (dirty & /*store*/ 1) input11_changes.store = /*store*/ ctx[0];
			input11.$set(input11_changes);
			const input12_changes = {};
			if (dirty & /*store*/ 1) input12_changes.store = /*store*/ ctx[0];
			input12.$set(input12_changes);
			const input13_changes = {};
			if (dirty & /*store*/ 1) input13_changes.store = /*store*/ ctx[0];
			input13.$set(input13_changes);
			const input14_changes = {};
			if (dirty & /*store*/ 1) input14_changes.store = /*store*/ ctx[0];
			input14.$set(input14_changes);
			const input15_changes = {};
			if (dirty & /*store*/ 1) input15_changes.store = /*store*/ ctx[0];
			input15.$set(input15_changes);
			const input16_changes = {};
			if (dirty & /*store*/ 1) input16_changes.store = /*store*/ ctx[0];
			input16.$set(input16_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(input0.$$.fragment, local);
			transition_in(input1.$$.fragment, local);
			transition_in(input2.$$.fragment, local);
			transition_in(input3.$$.fragment, local);
			transition_in(input4.$$.fragment, local);
			transition_in(input5.$$.fragment, local);
			transition_in(input6.$$.fragment, local);
			transition_in(select0.$$.fragment, local);
			transition_in(input7.$$.fragment, local);
			transition_in(input8.$$.fragment, local);
			transition_in(input9.$$.fragment, local);
			transition_in(input10.$$.fragment, local);
			transition_in(select1.$$.fragment, local);
			transition_in(input11.$$.fragment, local);
			transition_in(input12.$$.fragment, local);
			transition_in(input13.$$.fragment, local);
			transition_in(input14.$$.fragment, local);
			transition_in(input15.$$.fragment, local);
			transition_in(input16.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(input0.$$.fragment, local);
			transition_out(input1.$$.fragment, local);
			transition_out(input2.$$.fragment, local);
			transition_out(input3.$$.fragment, local);
			transition_out(input4.$$.fragment, local);
			transition_out(input5.$$.fragment, local);
			transition_out(input6.$$.fragment, local);
			transition_out(select0.$$.fragment, local);
			transition_out(input7.$$.fragment, local);
			transition_out(input8.$$.fragment, local);
			transition_out(input9.$$.fragment, local);
			transition_out(input10.$$.fragment, local);
			transition_out(select1.$$.fragment, local);
			transition_out(input11.$$.fragment, local);
			transition_out(input12.$$.fragment, local);
			transition_out(input13.$$.fragment, local);
			transition_out(input14.$$.fragment, local);
			transition_out(input15.$$.fragment, local);
			transition_out(input16.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h20);
			if (detaching) detach_dev(t1);
			destroy_component(input0, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(input1, detaching);
			if (detaching) detach_dev(t3);
			destroy_component(input2, detaching);
			if (detaching) detach_dev(t4);
			destroy_component(input3, detaching);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(h21);
			if (detaching) detach_dev(t7);
			destroy_component(input4, detaching);
			if (detaching) detach_dev(t8);
			destroy_component(input5, detaching);
			if (detaching) detach_dev(t9);
			destroy_component(input6, detaching);
			if (detaching) detach_dev(t10);
			destroy_component(select0, detaching);
			if (detaching) detach_dev(t11);
			destroy_component(input7, detaching);
			if (detaching) detach_dev(t12);
			if (detaching) detach_dev(h22);
			if (detaching) detach_dev(t14);
			destroy_component(input8, detaching);
			if (detaching) detach_dev(t15);
			destroy_component(input9, detaching);
			if (detaching) detach_dev(t16);
			destroy_component(input10, detaching);
			if (detaching) detach_dev(t17);
			destroy_component(select1, detaching);
			if (detaching) detach_dev(t18);
			destroy_component(input11, detaching);
			if (detaching) detach_dev(t19);
			if (detaching) detach_dev(h23);
			if (detaching) detach_dev(t21);
			destroy_component(input12, detaching);
			if (detaching) detach_dev(t22);
			destroy_component(input13, detaching);
			if (detaching) detach_dev(t23);
			destroy_component(input14, detaching);
			if (detaching) detach_dev(t24);
			destroy_component(input15, detaching);
			if (detaching) detach_dev(t25);
			destroy_component(input16, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(9:1) <Form {name} let:store>",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let main;
	let form;
	let current;

	form = new Form({
			props: {
				name,
				$$slots: {
					default: [
						create_default_slot,
						({ store }) => ({ 0: store }),
						({ store }) => store ? 1 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			main = element("main");
			create_component(form.$$.fragment);
			add_location(main, file$3, 7, 0, 239);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, main, anchor);
			mount_component(form, main, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const form_changes = {};

			if (dirty & /*$$scope, store*/ 65) {
				form_changes.$$scope = { dirty, ctx };
			}

			form.$set(form_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(form.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(form.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(main);
			destroy_component(form);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const name = "order";

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ states, Form, Input, Select, name });
	return [];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$3.name
		});
	}
}

const app = new App({
    target: document.body,
});

export default app;
//# sourceMappingURL=bundle.js.map
