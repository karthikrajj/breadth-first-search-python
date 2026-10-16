# Breadth-First Search (BFS) Algorithm
## Python Implementation & Interactive Visualizer

---

## Overview

This project implements the **Breadth-First Search (BFS)** graph traversal algorithm in Python. BFS explores all vertices of a graph level by level, starting from a given source vertex, using a **FIFO queue**.

BFS is a fundamental graph traversal algorithm used in computer science for shortest path finding in unweighted graphs, connected component detection, and level-order traversal.

---

## Algorithm Definition

Breadth-First Search (BFS) traverses a graph by:
1. Starting at a chosen source vertex.
2. Visiting all neighbours at the current depth before moving to vertices at the next depth level.
3. Using a **queue** (First In, First Out) to maintain the order of exploration.
4. Marking vertices as **visited when enqueued** to prevent revisiting.

### Pseudocode

```
BFS(Graph, start):
    visited = {start}
    queue = [start]

    while queue is not empty:
        vertex = remove_front(queue)
        output(vertex)

        for each neighbour of vertex:
            if neighbour is not visited:
                mark neighbour as visited
                add neighbour to queue
```

### Complexity

| Metric | Value |
|---|---|
| Time Complexity | O(V + E) |
| Space Complexity | O(V) |
| Data Structure | `collections.deque` (FIFO Queue) |
| Graph Representation | Adjacency List (Dictionary) |

Where V = number of vertices, E = number of edges.

---

## Project Structure

```
breadth-first-search-python/
├── bfs.py                    # Main BFS implementation (Python)
├── README.md                 # Project documentation
├── algorithm_explanation.md  # Detailed algorithm theory & walkthrough
├── test_cases.md             # Test cases & expected outputs
├── requirements.txt          # Requirements information
├── video_script.md           # 2-minute presentation script
└── visualization/            # Interactive BFS visualizer
    ├── index.html            # Main canvas visualizer page
    ├── learn.html            # Learning mode & complexity page
    ├── style.css             # Ember theme stylesheet
    └── script.js             # JavaScript visualizer logic
```

---

## Setup & Execution

### Prerequisites
- Python 3.6 or higher
- No external libraries required (uses only standard library `collections.deque`)

### Running the Python Implementation

```bash
# Run BFS with interactive menu
python bfs.py
```

The program provides three modes:
1. **Demo Mode** — Runs three pre-built examples (default graph, cyclic graph, disconnected graph).
2. **Interactive Mode** — Lets you enter a custom graph and starting vertex.
3. **Both** — Runs demo examples followed by interactive mode.

---

## 🌐 Live Interactive Visualization (GitHub Pages)

Experience the visualizer live directly in your browser:

- ⚡ **[Simulation Only Page](https://karthikrajj.github.io/breadth-first-search-python/visualization/index.html)** — Dedicated graph traversal canvas, node/edge editing, FIFO queue animation, and real-time output.
- 🎓 **[Simulation + Learning Mode Page](https://karthikrajj.github.io/breadth-first-search-python/visualization/learn.html)** — Interactive simulation combined with real-time step-by-step plain English explanations, algorithm pseudocode with live execution highlighting, complexity analysis ($O(V+E)$), and Python code reference (`bfs.py`).

👉 **Live Site**: [https://karthikrajj.github.io/breadth-first-search-python/](https://karthikrajj.github.io/breadth-first-search-python/)

### Running Locally

To open directly in your browser without an internet connection:
```bash
# Open directly in your browser
start visualization/index.html
```

---

## License

MIT License