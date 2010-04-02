(function(){
  var CoffeeScript, fs, helpers, no_such_task, oparse, options, optparse, path, print_tasks, switches, tasks;
  var __hasProp = Object.prototype.hasOwnProperty;
  // `cake` is a simplified version of [Make](http://www.gnu.org/software/make/)
  // ([Rake](http://rake.rubyforge.org/), [Jake](http://github.com/280north/jake))
  // for CoffeeScript. You define tasks with names and descriptions in a Cakefile,
  // and can call them from the command line, or invoke them from other tasks.
  // Running `cake` with no arguments will print out a list of all the tasks in the
  // current directory's Cakefile.
  // External dependencies.
  fs = require('fs');
  path = require('path');
  helpers = require('./helpers').helpers;
  optparse = require('./optparse');
  CoffeeScript = require('./coffee-script');
  // Keep track of the list of defined tasks, the accepted options, and so on.
  tasks = {};
  options = {};
  switches = [];
  oparse = null;
  // Mixin the top-level Cake functions for Cakefiles to use directly.
  helpers.extend(global, {
    // Define a Cake task with a short name, a sentence description,
    // and the function to run as the action itself.
    task: function task(name, description, action) {
      tasks[name] = {
        name: name,
        description: description,
        action: action
      };
      return tasks[name];
    },
    // Define an option that the Cakefile accepts. The parsed options hash,
    // containing all of the command-line options passed, will be made available
    // as the first argument to the action.
    option: function option(letter, flag, description) {
      return switches.push([letter, flag, description]);
    },
    // Invoke another task in the current Cakefile.
    invoke: function invoke(name) {
      if (!(tasks[name])) {
        no_such_task(name);
      }
      return tasks[name].action(options);
    }
  });
  // Run `cake`. Executes all of the tasks you pass, in order. Note that Node's
  // asynchrony may cause tasks to execute in a different order than you'd expect.
  // If no tasks are passed, print the help screen.
  exports.run = function run() {
    return path.exists('Cakefile', function(exists) {
      var _a, _b, _c, _d, arg, args;
      if (!(exists)) {
        throw new Error("Cakefile not found in " + (process.cwd()));
      }
      args = process.argv.slice(2, process.argv.length);
      CoffeeScript.run(fs.readFileSync('Cakefile'), {
        source: 'Cakefile'
      });
      oparse = new optparse.OptionParser(switches);
      if (!(args.length)) {
        return print_tasks();
      }
      options = oparse.parse(args);
      _a = []; _b = options.arguments;
      for (_c = 0, _d = _b.length; _c < _d; _c++) {
        arg = _b[_c];
        _a.push(invoke(arg));
      }
      return _a;
    });
  };
  // Display the list of Cake tasks in a format similar to `rake -T`
  print_tasks = function print_tasks() {
    var _a, _b, _c, _d, _e, _f, i, name, spaces, task;
    puts('');
    _a = tasks;
    for (name in _a) { if (__hasProp.call(_a, name)) {
      task = _a[name];
      spaces = 20 - name.length;
      spaces = spaces > 0 ? (function() {
        _b = []; _e = 0; _f = spaces;
        for (_d = 0, i = _e; (_e <= _f ? i <= _f : i >= _f); (_e <= _f ? i += 1 : i -= 1), _d++) {
          _b.push(' ');
        }
        return _b;
      }).call(this).join('') : '';
      puts("cake " + name + spaces + " # " + (task.description));
    }}
    if (switches.length) {
      return puts(oparse.help());
    }
  };
  // Print an error and exit when attempting to all an undefined task.
  no_such_task = function no_such_task(task) {
    process.stdio.writeError("No such task: \"" + task + "\"\n");
    return process.exit(1);
  };
})();
