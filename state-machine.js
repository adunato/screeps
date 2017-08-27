'use strict'

//--------------------------------MIXIN----------------------------------------------------------

var mixin = function(target, sources) {
  var n, source, key;
  for(n = 1 ; n < arguments.length ; n++) {
    source = arguments[n];
    for(key in source) {
      if (source.hasOwnProperty(key))
        target[key] = source[key];
    }
  }
  return target;
}

//--------------------------------CAMELIZE------------------------------------------------------

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

module.exports = camelize;

//--------------------------------PLUGIN-------------------------------------------------------

module.exports = {

  build: function(target, config) {
    var n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(fsm, name, additional) {
    var n, max, method, plugin,
        plugins = fsm.config.plugins,
        args    = [fsm.context];

    if (additional)
      args = args.concat(additional)

    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }

}

//--------------------------------CONFIG-------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.transitions = [];
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//--------------------------------JSM--------------------------------------------------------------

function JSM(context, config) {
  this.context   = context;
  this.config    = config;
  this.state     = config.init.from;
  this.observers = [context];
}

//-------------------------------------------------------------------------------------------------

mixin(JSM.prototype, {

  init: function(args) {
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active)
      return this.fire(this.config.init.name, []);
  },

  is: function(state) {
    return Array.isArray(state) ? (state.indexOf(this.state) >= 0) : (this.state === state);
  },

  isPending: function() {
    return this.pending;
  },

  can: function(transition) {
    return !this.isPending() && !!this.seek(transition);
  },

  cannot: function(transition) {
    return !this.can(transition);
  },

  allStates: function() {
    return this.config.allStates();
  },

  allTransitions: function() {
    return this.config.allTransitions();
  },

  transitions: function() {
    return this.config.transitionsFor(this.state);
  },

  seek: function(transition, args) {
    var wildcard = this.config.defaults.wildcard,
        entry    = this.config.transitionFor(this.state, transition),
        to       = entry && entry.to;
    if (typeof to === 'function')
      return to.apply(this.context, args);
    else if (to === wildcard)
      return this.state
    else
      return to
  },

  fire: function(transition, args) {
    return this.transit(transition, this.state, this.seek(transition, args), args);
  },

  transit: function(transition, from, to, args) {

    var lifecycle = this.config.lifecycle,
        changed   = this.config.options.observeUnchangedState || (from !== to);

    if (!to)
      return this.context.onInvalidTransition(transition, from, to);

    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);

    this.config.addState(to);  // might need to add this state if it's unknown (e.g. conditional transition or goto)

    this.beginTransit();

    args.unshift({             // this context will be passed to each lifecycle event observer
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context
    });

    return this.observeEvents([
                this.observersForEvent(lifecycle.onBefore.transition),
                this.observersForEvent(lifecycle.onBefore[transition]),
      changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED,
                this.observersForEvent(lifecycle.on.transition),
      changed ? [ 'doTransit', [ this ] ]                       : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to])   : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to])        : UNOBSERVED,
                this.observersForEvent(lifecycle.onAfter.transition),
                this.observersForEvent(lifecycle.onAfter[transition]),
                this.observersForEvent(lifecycle.on[transition])
    ], args);
  },

  beginTransit: function()          { this.pending = true;                 },
  endTransit:   function(result)    { this.pending = false; return result; },
  failTransit:  function(result)    { this.pending = false; throw result;  },
  doTransit:    function(lifecycle) { this.state = lifecycle.to;           },

  observe: function(args) {
    if (args.length === 2) {
      var observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  },

  observersForEvent: function(event) { // TODO: this could be cached
    var n = 0, max = this.observers.length, observer, result = [];
    for( ; n < max ; n++) {
      observer = this.observers[n];
      if (observer[event])
        result.push(observer);
    }
    return [ event, result, true ]
  },

  observeEvents: function(events, args, previousEvent, previousResult) {
    if (events.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }

    var event     = events[0][0],
        observers = events[0][1],
        pluggable = events[0][2];

    args[0].event = event;
    if (event && pluggable && event !== previousEvent)
      plugin.hook(this, 'lifecycle', args);

    if (observers.length === 0) {
      events.shift();
      return this.observeEvents(events, args, event, previousResult);
    }
    else {
      var observer = observers.shift(),
          result = observer[event].apply(observer, args);
      if (result && typeof result.then === 'function') {
        return result.then(this.observeEvents.bind(this, events, args, event))
                     .catch(this.failTransit.bind(this))
      }
      else if (result === false) {
        return this.endTransit(false);
      }
      else {
        return this.observeEvents(events, args, event, result);
      }
    }
  },

  onInvalidTransition: function(transition, from, to) {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  },

  onPendingTransition: function(transition, from, to) {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = JSM;


//----------------------------VISUALIZE---------------------------------------------------------------------

function visualize(fsm, options) {
  return dotify(dotcfg(fsm, options));
}

//-------------------------------------------------------------------------------------------------

function dotcfg(fsm, options) {

  options = options || {}

  var config      = dotcfg.fetch(fsm),
      name        = options.name,
      rankdir     = dotcfg.rankdir(options.orientation),
      states      = dotcfg.states(config, options),
      transitions = dotcfg.transitions(config, options),
      result      = { }

  if (name)
    result.name = name

  if (rankdir)
    result.rankdir = rankdir

  if (states && states.length > 0)
    result.states = states

  if (transitions && transitions.length > 0)
    result.transitions = transitions

  return result
}

//-------------------------------------------------------------------------------------------------

dotcfg.fetch = function(fsm) {
  return (typeof fsm === 'function') ? fsm.prototype._fsm.config
                                     : fsm._fsm.config
}

dotcfg.rankdir = function(orientation) {
  if (orientation === 'horizontal')
    return 'LR';
  else if (orientation === 'vertical')
    return 'TB';
}

dotcfg.states = function(config, options) {
  var index, states = config.states;
  if (!options.init) { // if not showing init transition, then slice out the implied init :from state
    index  = states.indexOf(config.init.from);
    states = states.slice(0, index).concat(states.slice(index+1));
  }
  return states;
}

dotcfg.transitions = function(config, options) {
  var n, max, transition,
      init        = config.init,
      transitions = config.options.transitions || [], // easier to visualize using the ORIGINAL transition declarations rather than our run-time mapping
      output = [];
  if (options.init && init.active)
    dotcfg.transition(init.name, init.from, init.to, init.dot, config, options, output)
  for (n = 0, max = transitions.length ; n < max ; n++) {
    transition = config.options.transitions[n]
    dotcfg.transition(transition.name, transition.from, transition.to, transition.dot, config, options, output)
  }
  return output
}

dotcfg.transition = function(name, from, to, dot, config, options, output) {
  var n, max, wildcard = config.defaults.wildcard

  if (Array.isArray(from)) {
    for(n = 0, max = from.length ; n < max ; n++)
      dotcfg.transition(name, from[n], to, dot, config, options, output)
  }
  else if (from === wildcard || from === undefined) {
    for(n = 0, max = config.states.length ; n < max ; n++)
      dotcfg.transition(name, config.states[n], to, dot, config, options, output)
  }
  else if (to === wildcard || to === undefined) {
    dotcfg.transition(name, from, from, dot, config, options, output)
  }
  else if (typeof to === 'function') {
    // do nothing, can't display conditional transition
  }
  else {
    output.push(mixin({}, { from: from, to: to, label: pad(name) }, dot || {}))
  }

}

//-------------------------------------------------------------------------------------------------

function pad(name) {
  return " " + name + " "
}

function quote(name) {
  return "\"" + name + "\""
}

function dotify(dotcfg) {

  dotcfg = dotcfg || {};

  var name        = dotcfg.name || 'fsm',
      states      = dotcfg.states || [],
      transitions = dotcfg.transitions || [],
      rankdir     = dotcfg.rankdir,
      output      = [],
      n, max;

  output.push("digraph " + quote(name) + " {")
  if (rankdir)
    output.push("  rankdir=" + rankdir + ";")
  for(n = 0, max = states.length ; n < max ; n++)
    output.push(dotify.state(states[n]))
  for(n = 0, max = transitions.length ; n < max ; n++)
    output.push(dotify.edge(transitions[n]))
  output.push("}")
  return output.join("\n")

}

dotify.state = function(state) {
  return "  " + quote(state) + ";"
}

dotify.edge = function(edge) {
  return "  " + quote(edge.from) + " -> " + quote(edge.to) + dotify.edge.attr(edge) + ";"
}

dotify.edge.attr = function(edge) {
  var n, max, key, keys = Object.keys(edge).sort(), output = [];
  for(n = 0, max = keys.length ; n < max ; n++) {
    key = keys[n];
    if (key !== 'from' && key !== 'to')
      output.push(key + "=" + quote(edge[key]))
  }
  return output.length > 0 ? " [ " + output.join(" ; ") + " ]" : ""
}

//-------------------------------------------------------------------------------------------------

visualize.dotcfg = dotcfg;
visualize.dotify = dotify;

//-------------------------------------------------------------------------------------------------

module.exports = visualize;

//--------------------HISTORY----------------------------------------------------------------------

module.exports = function(options) { options = options || {};

  var past       = camelize(options.name || options.past   || 'history'),
      future     = camelize(                options.future || 'future'),
      clear      = camelize.prepended('clear', past),
      back       = camelize.prepended(past,   'back'),
      forward    = camelize.prepended(past,   'forward'),
      canBack    = camelize.prepended('can',   back),
      canForward = camelize.prepended('can',   forward),
      max        = options.max;

  var plugin = {

    configure: function(config) {
      config.addTransitionLifecycleNames(back);
      config.addTransitionLifecycleNames(forward);
    },

    init: function(instance) {
      instance[past]   = [];
      instance[future] = [];
    },

    lifecycle: function(instance, lifecycle) {
      if (lifecycle.event === 'onEnterState') {
        instance[past].push(lifecycle.to);
        if (max && instance[past].length > max)
          instance[past].shift();
        if (lifecycle.transition !== back && lifecycle.transition !== forward)
          instance[future].length = 0;
      }
    },

    methods:    {},
    properties: {}

  }

  plugin.methods[clear] = function() {
    this[past].length = 0
    this[future].length = 0
  }

  plugin.properties[canBack] = {
    get: function() {
      return this[past].length > 1
    }
  }

  plugin.properties[canForward] = {
    get: function() {
      return this[future].length > 0
    }
  }

  plugin.methods[back] = function() {
    if (!this[canBack])
      throw Error('no history');
    var from = this[past].pop(),
        to   = this[past].pop();
    this[future].push(from);
    this._fsm.transit(back, from, to, []);
  }

  plugin.methods[forward] = function() {
    if (!this[canForward])
      throw Error('no history');
    var from = this.state,
        to = this[future].pop();
    this._fsm.transit(forward, from, to, []);
  }

  return plugin;

}

//-------------------------------EXCEPTION------------------------------------------------------

module.exports = function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}


//-------------------------------APP------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------

camelize.prepended = function(prepend, label) {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}
	
//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },
  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._fsm();
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

//===============================================================================================

module.exports = StateMachine;
