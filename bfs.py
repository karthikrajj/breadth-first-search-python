#!/usr/bin/env python3
"""
Breadth-First Search (BFS) Algorithm Implementation
This program implements the BFS graph traversal algorithm using:
- Adjacency list representation for the graph
- collections.deque for efficient queue operations
- A visited set to prevent revisiting vertices

Author: [Student Name]
Date: October 2026
"""

from collections import deque


def bfs(graph, start, num_vertices):
    """
    Perform Breadth-First Search traversal on a graph.
    
    Args:
        graph (dict): Adjacency list representation of the graph.
                      Keys are vertex numbers, values are lists of adjacent vertices.
        start (int): The starting vertex for BFS traversal.
        num_vertices (int): Total number of vertices in the graph.
    
    Returns:
        list: The BFS traversal order as a list of vertices.
    
    Algorithm:
        1. Mark the starting vertex as visited.
        2. Insert the starting vertex into the queue.
        3. While the queue is not empty:
           a. Remove the front vertex from the queue (dequeue).
           b. Add it to the traversal output.
           c. For each unvisited neighbour of the current vertex:
              - Mark the neighbour as visited.
              - Add the neighbour to the queue (enqueue).
    
    Time Complexity: O(V + E) where V = vertices, E = edges
    Space Complexity: O(V) for the visited set and queue
    """
    # Validate start vertex
    if start < 0 or start >= num_vertices:
        raise ValueError(
            f"Invalid starting vertex {start}. "
            f"Vertex must be between 0 and {num_vertices - 1}."
        )
    
    # Initialize visited set and queue
    visited = set()
    queue = deque()
    traversal_order = []
    
    # Step 1: Mark the starting vertex as visited
    visited.add(start)
    
    # Step 2: Insert the starting vertex into the queue
    queue.append(start)
    
    # Step 3: Process the queue until it is empty
    while queue:
        # Step 3a: Remove the front vertex from the queue (FIFO)
        vertex = queue.popleft()
        
        # Step 3b: Add it to the traversal output
        traversal_order.append(vertex)
        
        # Step 3c: Visit all adjacent vertices
        for neighbour in graph.get(vertex, []):
            if neighbour not in visited:
                # Mark neighbour as visited (when enqueued, not dequeued)
                visited.add(neighbour)
                # Add neighbour to the queue
                queue.append(neighbour)
    
    return traversal_order


def build_graph(num_vertices, edges):
    """
    Build an adjacency list representation of an undirected graph.
    
    Args:
        num_vertices (int): Number of vertices (labelled 0 to num_vertices-1).
        edges (list of tuples): Each tuple (u, v) represents an edge.
    
    Returns:
        dict: Adjacency list where each key maps to a list of neighbours.
    """
    graph = {i: [] for i in range(num_vertices)}
    
    for u, v in edges:
        if u < 0 or u >= num_vertices or v < 0 or v >= num_vertices:
            raise ValueError(
                f"Invalid edge ({u}, {v}). "
                f"Vertices must be between 0 and {num_vertices - 1}."
            )
        # Undirected graph: add edge in both directions
        graph[u].append(v)
        graph[v].append(u)
    
    return graph


def get_valid_integer(prompt, min_val=None, max_val=None):
    """
    Get a valid integer from user input with optional range validation.
    
    Args:
        prompt (str): The input prompt to display.
        min_val (int, optional): Minimum acceptable value.
        max_val (int, optional): Maximum acceptable value.
    
    Returns:
        int: A validated integer.
    """
    while True:
        try:
            value = int(input(prompt))
            if min_val is not None and value < min_val:
                print(f"Error: Value must be at least {min_val}. Please try again.")
                continue
            if max_val is not None and value > max_val:
                print(f"Error: Value must be at most {max_val}. Please try again.")
                continue
            return value
        except ValueError:
            print("Error: Please enter a valid integer.")


def get_edge_input(num_vertices):
    """
    Get a valid edge (pair of vertices) from user input.
    
    Args:
        num_vertices (int): Total number of vertices for validation.
    
    Returns:
        tuple: A validated edge as (u, v).
    """
    while True:
        try:
            line = input("  Enter edge (u v): ").strip()
            parts = line.split()
            if len(parts) != 2:
                print("  Error: Please enter exactly two vertex numbers separated by a space.")
                continue
            u, v = int(parts[0]), int(parts[1])
            if u < 0 or u >= num_vertices or v < 0 or v >= num_vertices:
                print(
                    f"  Error: Vertices must be between 0 and {num_vertices - 1}. "
                    f"Got ({u}, {v})."
                )
                continue
            return (u, v)
        except ValueError:
            print("  Error: Both values must be integers. Example: 0 1")


def print_graph(graph, num_vertices):
    """
    Display the adjacency list representation of the graph.
    
    Args:
        graph (dict): The adjacency list.
        num_vertices (int): Number of vertices.
    """
    print("\nAdjacency List Representation:")
    print("-" * 35)
    for vertex in range(num_vertices):
        neighbours = graph.get(vertex, [])
        print(f"  Vertex {vertex} -> {neighbours}")
    print("-" * 35)


def run_example(title, num_vertices, edges, start, description=""):
    """
    Run a BFS example with the given parameters and display results.
    
    Args:
        title (str): Title of the example.
        num_vertices (int): Number of vertices.
        edges (list): List of edges as tuples.
        start (int): Starting vertex.
        description (str): Optional description of the example.
    """
    print(f"\n{'=' * 55}")
    print(f"  {title}")
    print(f"{'=' * 55}")
    
    if description:
        print(f"  {description}")
    
    print(f"\n  Vertices: {num_vertices} (labelled 0 to {num_vertices - 1})")
    print(f"  Edges: {edges}")
    print(f"  Starting vertex: {start}")
    
    graph = build_graph(num_vertices, edges)
    print_graph(graph, num_vertices)
    
    traversal = bfs(graph, start, num_vertices)
    
    print(f"\n  BFS Traversal: {' '.join(map(str, traversal))}")
    print(f"  Vertices visited: {len(traversal)} out of {num_vertices}")
    
    if len(traversal) < num_vertices:
        unvisited = set(range(num_vertices)) - set(traversal)
        print(
            f"  Note: Vertices {sorted(unvisited)} are not reachable "
            f"from vertex {start} (disconnected component)."
        )
    
    print()


def run_demo_examples():
    """
    Run all three required demonstration examples.
    """
    print("\n" + "#" * 55)
    print("#  BFS Algorithm — Demonstration Examples")
    print("#" * 55)
    
    # Example 1: Default six-vertex graph (tree structure)
    run_example(
        title="Example 1: Default Graph (Tree Structure)",
        num_vertices=6,
        edges=[(0, 1), (0, 2), (1, 3), (1, 4), (2, 5)],
        start=0,
        description="A simple tree with 6 vertices. All vertices are reachable."
    )
    
    # Example 2: Graph with a cycle
    run_example(
        title="Example 2: Graph with a Cycle",
        num_vertices=5,
        edges=[(0, 1), (1, 2), (2, 3), (3, 4), (4, 0), (1, 3)],
        start=0,
        description=(
            "This graph contains cycles (0-1-4-0 and 1-2-3-1).\n"
            "  BFS handles cycles correctly — visited vertices are never enqueued again."
        )
    )
    
    # Example 3: Disconnected graph
    run_example(
        title="Example 3: Disconnected Graph",
        num_vertices=7,
        edges=[(0, 1), (0, 2), (1, 2), (3, 4), (5, 6)],
        start=0,
        description=(
            "This graph has three components: {0,1,2}, {3,4}, and {5,6}.\n"
            "  BFS from vertex 0 only traverses the component containing vertex 0."
        )
    )


def interactive_mode():
    """
    Interactive mode: accept user input to build and traverse a custom graph.
    """
    print("\n" + "=" * 55)
    print("  BFS — Interactive Mode")
    print("=" * 55)
    print("  Build your own graph and run BFS traversal.\n")
    
    # Get number of vertices
    num_vertices = get_valid_integer(
        "Enter the number of vertices (≥ 1): ", min_val=1
    )
    
    # Get number of edges
    num_edges = get_valid_integer(
        "Enter the number of edges (≥ 0): ", min_val=0
    )
    
    # Get edges
    edges = []
    if num_edges > 0:
        print(f"\nEnter {num_edges} edge(s) as pairs of vertices (e.g., '0 1'):")
        for i in range(num_edges):
            print(f"  Edge {i + 1}/{num_edges}:")
            edge = get_edge_input(num_vertices)
            edges.append(edge)
    
    # Build graph
    graph = build_graph(num_vertices, edges)
    print_graph(graph, num_vertices)
    
    # Get starting vertex
    start = get_valid_integer(
        f"\nEnter the starting vertex (0 to {num_vertices - 1}): ",
        min_val=0,
        max_val=num_vertices - 1
    )
    
    # Run BFS
    traversal = bfs(graph, start, num_vertices)
    
    print(f"\n  BFS Traversal: {' '.join(map(str, traversal))}")
    print(f"  Vertices visited: {len(traversal)} out of {num_vertices}")
    
    if len(traversal) < num_vertices:
        unvisited = set(range(num_vertices)) - set(traversal)
        print(
            f"\n  Note: Vertices {sorted(unvisited)} are not reachable "
            f"from vertex {start}.\n"
            f"  In a disconnected graph, BFS only traverses the connected\n"
            f"  component that contains the starting vertex."
        )


def main():
    """
    Main entry point. Provides menu for demo examples or interactive mode.
    """
    print("\n" + "*" * 55)
    print("*  Breadth-First Search (BFS) Algorithm")
    print("*  Python Implementation")
    print("*" * 55)
    print("\nBFS explores a graph level by level using a FIFO queue.")
    print("Time Complexity: O(V + E) | Space Complexity: O(V)")
    
    print("\nChoose an option:")
    print("  1. Run demonstration examples (recommended)")
    print("  2. Enter a custom graph (interactive mode)")
    print("  3. Run both")
    
    choice = get_valid_integer("\nYour choice (1, 2, or 3): ", min_val=1, max_val=3)
    
    if choice == 1:
        run_demo_examples()
    elif choice == 2:
        interactive_mode()
    elif choice == 3:
        run_demo_examples()
        interactive_mode()
    
    print("\n" + "*" * 55)
    print("*  BFS traversal complete. Thank you!")
    print("*" * 55 + "\n")


if __name__ == "__main__":
    main()
