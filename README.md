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

## Interactive Visualization

The project includes an interactive two-page visualizer built with HTML, CSS, and JavaScript:

- **Visualizer Page** (`visualization/index.html`) — Graph canvas, BFS controls, FIFO queue animation, and traversal output.
- **Learning Page** (`visualization/learn.html`) — Step-by-step explanations, algorithm pseudocode with live highlighting, and complexity analysis.

To view:
```bash
# Open directly in your browser
start visualization/index.html
```

---

## License

MIT License