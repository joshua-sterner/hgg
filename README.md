# hgg
Hierarchical Graph-based GUI

An experimental GUI framework intended to enable efficient keyboard-driven UI navigation.

```
+---------------------------------------------------+
| Widget Node                                       |
+---------------------------------------------------+
| parent | children | left  | right | above | below |
| (0-1)  | (0-*)    | (0-*) | (0-*) | (0-*) | (0-*) |
+---------------------------------------------------+
```

The [js-prototype branch](https://github.com/joshua-sterner/hgg/tree/js-prototype) has a
work-in-progress prototype of this project. The real implementation of this project will
likely be written in C++, but I want to have a more concrete design in place first.

![screenshot of javascript prototype](https://raw.githubusercontent.com/joshua-sterner/hgg/js-prototype/js-prototype-screenshot.png)
