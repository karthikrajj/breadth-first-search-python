# BFS Test Cases
## DAA Assignment 2

---

## Test Case 1: Default Six-Vertex Graph

**Description:** A simple tree-structured graph with 6 vertices.

**Input:**
- Vertices: 6
- Edges: (0,1), (0,2), (1,3), (1,4), (2,5)
- Starting vertex: 0

**Expected Output:**
```
BFS Traversal: 0 1 2 3 4 5
Vertices visited: 6 out of 6
```

**Verification:** All vertices are reachable. BFS proceeds level by level: Level 0 = {0}, Level 1 = {1, 2}, Level 2 = {3, 4, 5}.

---

## Test Case 2: Graph with a Cycle

**Description:** A graph containing cycles to verify that BFS does not revisit vertices.

**Input:**
- Vertices: 5
- Edges: (0,1), (1,2), (2,3), (3,4), (4,0), (1,3)
- Starting vertex: 0

**Expected Output:**
```
BFS Traversal: 0 1 4 2 3
Vertices visited: 5 out of 5
```

**Verification:** Despite cycles 0→1→4→0 and 1→2→3→1, each vertex appears exactly once. The visited set prevents re-enqueuing.

---

## Test Case 3: Disconnected Graph

**Description:** A graph with three separate components.

**Input:**
- Vertices: 7
- Edges: (0,1), (0,2), (1,2), (3,4), (5,6)
- Starting vertex: 0

**Expected Output:**
```
BFS Traversal: 0 1 2
Vertices visited: 3 out of 7
Note: Vertices [3, 4, 5, 6] are not reachable from vertex 0.
```

**Verification:** Only the component {0, 1, 2} is traversed. Vertices 3, 4, 5, 6 belong to other components.

---

## Test Case 4: Single Vertex, No Edges

**Description:** The simplest possible graph — one isolated vertex.

**Input:**
- Vertices: 1
- Edges: (none)
- Starting vertex: 0

**Expected Output:**
```
BFS Traversal: 0
Vertices visited: 1 out of 1
```

**Verification:** BFS correctly handles a graph with a single vertex and no edges.

---

## Test Case 5: Invalid Starting Vertex

**Description:** Starting vertex is out of range.

**Input:**
- Vertices: 5
- Starting vertex: 7

**Expected Output:**
```
Error: Invalid starting vertex 7. Vertex must be between 0 and 4.
```

**Verification:** The program raises a ValueError with a clear message.

---

## Test Case 6: Invalid Edge Endpoints

**Description:** An edge references a vertex that does not exist.

**Input:**
- Vertices: 3
- Edge: (0, 5)

**Expected Output:**
```
Error: Invalid edge (0, 5). Vertices must be between 0 and 2.
```

**Verification:** The program validates edge endpoints during graph construction.

---

## Test Case 7: Malformed Input

**Description:** Non-integer input is provided where an integer is expected.

**Input:**
- Number of vertices: "abc"

**Expected Output:**
```
Error: Please enter a valid integer.
```

**Verification:** The program catches ValueError and prompts the user again.

---

## Test Case 8: Negative Vertex Count

**Description:** User enters a negative number of vertices.

**Input:**
- Number of vertices: -3

**Expected Output:**
```
Error: Value must be at least 1. Please try again.
```

**Verification:** The program rejects negative values and prompts again.

---

## Summary

| Test Case | Type | Result |
|---|---|---|
| 1. Default graph | Normal | ✅ Correct traversal |
| 2. Cyclic graph | Edge case | ✅ No repeated visits |
| 3. Disconnected graph | Edge case | ✅ Partial traversal |
| 4. Single vertex | Edge case | ✅ Single vertex output |
| 5. Invalid start vertex | Error handling | ✅ Clear error message |
| 6. Invalid edge | Error handling | ✅ Clear error message |
| 7. Malformed input | Error handling | ✅ Prompts again |
| 8. Negative count | Error handling | ✅ Rejects and prompts |
