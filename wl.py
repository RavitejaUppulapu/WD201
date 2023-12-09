# Define the constants
INF = 4e18
# Read the input
X = input()
Y = input()
S, R = map(int, input().split())
# Get the lengths of X and Y
n, m = len(X), len(Y)
# Reverse Y and store it as Y1
Y1 = Y[::-1]

# Initialize the dynamic programming table
dp = [[INF] * (m + 1) for _ in range(n + 1)]

# Define the base case: if X is empty, the string factor is zero
dp[0][0] = 0

# Define the recursive function to find the minimum string factor
def f(i, j):
    # Memoization: if the value is already computed, return it
    if dp[i][j] != INF:
        return dp[i][j]
    # Initialize the minimum string factor as infinity
    mini = INF
    # Try all possible sub strings of Y from j to 0
    for k in range(j, 0, -1):
        # Check if the sub string of Y matches a suffix of X
        if Y[k-1:j] == X[i-j+k:i]:
            # Update the minimum string factor with the cost of S plus the cost of the remaining sub strings
            mini = min(mini, S + f(i-j+k, k-1))
        # Check if the sub string of Y1 matches a suffix of X
        if Y1[k-1:j] == X[i-j+k:i]:
            # Update the minimum string factor with the cost of R plus the cost of the remaining sub strings
            mini = min(mini, R + f(i-j+k, k-1))
    # Store and return the minimum string factor
    dp[i][j] = mini
    return mini

# Find the minimum string factor of X
ans = f(n, m)
# Print the answer or "Impossible" if the string factor is infinity
if ans == INF:
    print("Impossible")
else:
    print(ans)
