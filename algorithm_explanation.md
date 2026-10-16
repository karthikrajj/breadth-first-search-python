# Breadth-First Search (BFS) — Algorithm Explanation
## DAA Assignment 2

---

## 1. What is BFS?

Breadth-First Search (BFS) is a graph traversal algorithm that explores vertices **level by level**. Starting from a source vertex, BFS visits all vertices at distance 1, then all vertices at distance 2, and so on.

BFS uses a **queue (FIFO — First In, First Out)** data structure to keep track of which vertex to visit next.

---

## 2. BFS Principle

The core idea behind BFS:

> Visit all neighbours of the current vertex before moving deeper into the graph.

This is in contrast to Depth-First Search (DFS), which goes as deep as possible before backtracking.

**Key properties:**
- BFS finds the **shortest path** (in terms of number of edges) between the source and every reachable vertex in an **unweighted graph**.
- BFS visits each vertex **at most once**.
- BFS uses **O(V)** extra space for the visited set and queue.

---

## 3. Algorithm Steps

### In Simple English

1. **Choose** a starting vertex.
2. **Mark** it as visited.
3. **Insert** it into the queue.
4. **Remove** the front vertex from the queue.
5. **Look** at all its neighbours.
6. For each **unvisited** neighbour:
   - Mark it as visited.
   - Add it to the **back** of the queue.
7. **Repeat** steps 4–6 until the queue is empty.

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

### Important Detail

Vertices are marked as **visited when they are enqueued**, not when they are dequeued. This ensures no vertex is added to the queue more than once, which:
- Prevents infinite loops in graphs with cycles.
- Guarantees O(V + E) time complexity.

---

## 4. Step-by-Step Example

### Graph

```
    0
   / \
  1   2
 / \   \
3   4   5
```

Edges: (0,1), (0,2), (1,3), (1,4), (2,5)

### BFS from vertex 0

| Step | Action | Queue (front → back) | Visited | Output |
|------|--------|----------------------|---------|--------|
| 1 | Start: enqueue 0, mark visited | [0] | {0} | — |
| 2 | Dequeue 0, process neighbours 1, 2 | [1, 2] | {0, 1, 2} | 0 |
| 3 | Dequeue 1, process neighbours 3, 4 | [2, 3, 4] | {0, 1, 2, 3, 4} | 0, 1 |
| 4 | Dequeue 2, process neighbour 5 | [3, 4, 5] | {0, 1, 2, 3, 4, 5} | 0, 1, 2 |
| 5 | Dequeue 3, no unvisited neighbours | [4, 5] | {0, 1, 2, 3, 4, 5} | 0, 1, 2, 3 |
| 6 | Dequeue 4, no unvisited neighbours | [5] | {0, 1, 2, 3, 4, 5} | 0, 1, 2, 3, 4 |
| 7 | Dequeue 5, no unvisited neighbours | [] | {0, 1, 2, 3, 4, 5} | 0, 1, 2, 3, 4, 5 |
| 8 | Queue empty — BFS complete | [] | {0, 1, 2, 3, 4, 5} | 0, 1, 2, 3, 4, 5 |

**Final BFS Traversal: 0 → 1 → 2 → 3 → 4 → 5**

---

## 5. Time Complexity Analysis

### O(V + E) — Using Adjacency List

- Each vertex is enqueued and dequeued **exactly once**: **O(V)**
- For each vertex, we examine all its edges: **O(E)** total across all vertices
- Combined: **O(V + E)**

### Why Adjacency List?

| Representation | BFS Time Complexity |
|---|---|
| Adjacency List | O(V + E) |
| Adjacency Matrix | O(V²) |

The adjacency list is more efficient for sparse graphs (where E << V²).

---

## 6. Space Complexity Analysis

### O(V) — Auxiliary Space

- **Visited set**: stores up to V vertices → O(V)
- **Queue**: stores up to V vertices in the worst case → O(V)
- **Graph storage** (adjacency list): O(V + E) — this is the input, not auxiliary space

**Auxiliary space complexity: O(V)**

---

## 7. Applications of BFS

1. **Shortest path in unweighted graphs**: BFS finds the shortest path (minimum number of edges) from the source to all reachable vertices.

2. **Level-order traversal**: In trees, BFS performs level-order traversal.

3. **Connected components**: BFS can identify all connected components of an undirected graph.

4. **Cycle detection**: BFS can detect cycles in undirected graphs.

5. **Bipartite graph checking**: BFS can determine if a graph is bipartite (two-colorable).

6. **Web crawling**: Search engines use BFS-like algorithms to discover web pages.

7. **Social network analysis**: Finding people within a certain degree of connection.

8. **GPS navigation**: Finding shortest routes in road networks (with uniform edge weights).

---

## 8. BFS vs DFS Comparison

| Feature | BFS | DFS |
|---|---|---|
| Data Structure | Queue (FIFO) | Stack (LIFO) |
| Traversal Order | Level by level | Depth first |
| Shortest Path | Yes (unweighted) | No |
| Space Complexity | O(V) | O(V) |
| Time Complexity | O(V + E) | O(V + E) |
| Use Case | Shortest path, level order | Topological sort, cycle detection |

---

## 9. Handling Special Cases

### Disconnected Graphs
BFS from a single source only visits vertices in the **same connected component**. Vertices in other components remain unvisited.

### Graphs with Cycles
The visited set prevents vertices from being enqueued more than once, so BFS correctly handles cycles without infinite loops.

### Self-Loops
If a vertex has an edge to itself, the self-loop is safely ignored because the vertex is already marked as visited.

### Isolated Vertices
A vertex with no edges forms its own component. BFS from an isolated vertex returns only that vertex.

---

## 10. Note on Traversal Order

The BFS traversal order depends on the **order in which adjacent vertices are processed**. If vertex 0 has neighbours [1, 2], processing 1 first gives a different traversal than processing 2 first. Both traversals are valid BFS results.

In this implementation, neighbours are processed in the order they appear in the adjacency list, which corresponds to the order edges were added.
