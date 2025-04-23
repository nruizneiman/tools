<?php
session_start();

// Clear winner if continuing the game
if (isset($_GET['continue'])) {
    unset($_SESSION['winner']);
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// Reset game
if (isset($_POST['confirm_reset'])) {
    session_destroy();
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// Setup game
if (isset($_POST['setup'])) {
    $_SESSION['teams'] = intval($_POST['teams']);
    $_SESSION['goal'] = intval($_POST['goal']);
    $_SESSION['scores'] = array_fill(0, $_SESSION['teams'], 0);
    $_SESSION['history'] = [];
    $_SESSION['winner'] = null;
    $_SESSION['team_names'] = array_map(fn($i) => "Team " . ($i + 1), range(0, $_SESSION['teams'] - 1)); // Initialize team names
}

// Update round scores
if (isset($_POST['update_scores']) && isset($_POST['round_points']) && isset($_POST['signs'])) {
    $round = [];
    foreach ($_POST['round_points'] as $i => $value) {
        $value = abs(intval($value));
        $sign = $_POST['signs'][$i] ?? 'positive';
        if ($sign === 'negative') {
            $value *= -1;
        }
        $_SESSION['scores'][$i] += $value;
        $round[] = $value;
    }
    $_SESSION['history'][] = $round;

    // Check winner
    foreach ($_SESSION['scores'] as $i => $score) {
        if ($score >= $_SESSION['goal']) {
            $_SESSION['winner'] = $i;
            break;
        }
    }
}

// Rename teams
if (isset($_POST['rename_teams']) && isset($_POST['team_names'])) {
    foreach ($_POST['team_names'] as $i => $name) {
        $_SESSION['team_names'][$i] = htmlspecialchars(trim($name)) ?: "Team " . ($i + 1);
    }
}

$game_started = isset($_SESSION['teams']) && isset($_SESSION['goal']);
$winner_index = $_SESSION['winner'] ?? null;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Buraco Counter</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .toggle-btn input[type="radio"] {
            display: none;
        }

        .toggle-btn label {
            margin: 0;
            cursor: pointer;
        }

        .toggle-btn .btn-check:checked + .btn {
            border-width: 2px;
        }
    </style>
</head>
<body class="bg-light">
<div class="container py-5">

    <h1 class="text-center mb-4">🃏 Buraco Score Counter</h1>

    <?php if (!$game_started): ?>
        <div class="card mx-auto" style="max-width: 400px;">
            <div class="card-body">
                <form method="post">
                    <div class="mb-3">
                        <label class="form-label">Number of Teams</label>
                        <input type="number" name="teams" class="form-control" min="2" value="2" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Goal Points</label>
                        <input type="number" name="goal" class="form-control" value="3000" required>
                    </div>
                    <button class="btn btn-primary w-100" type="submit" name="setup">Start Game</button>
                </form>
            </div>
        </div>
    <?php else: ?>

        <h4 class="text-center mb-3">Goal: <?= $_SESSION['goal'] ?> points</h4>

        <div class="table-responsive">
            <table class="table table-bordered text-center align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Round</th>
                        <?php foreach ($_SESSION['scores'] as $i => $_): ?>
                            <th><?= $_SESSION['team_names'][$i] ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($_SESSION['history'] as $roundIndex => $round): ?>
                        <tr>
                            <td><?= $roundIndex + 1 ?></td>
                            <?php foreach ($round as $value): ?>
                                <td><?= $value ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot class="table-secondary fw-bold">
                    <tr>
                        <td>Total</td>
                        <?php foreach ($_SESSION['scores'] as $total): ?>
                            <td><?= $total ?></td>
                        <?php endforeach; ?>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="d-flex justify-content-center gap-3 mt-4">
            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addPointsModal">Add/Subtract Points</button>
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#renameTeamsModal">Rename Teams</button>
            <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#resetConfirmModal">Reset Game</button>
        </div>

        <?php if (!is_null($winner_index)): ?>
            <div class="modal fade show" id="winnerModal" tabindex="-1" style="display:block;" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-centered">
                    <form method="post" class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">🏆 <?= $_SESSION['team_names'][$winner_index] ?> Wins!</h5>
                        </div>
                        <div class="modal-body">
                            <?= $_SESSION['team_names'][$winner_index] ?> has reached <?= $_SESSION['scores'][$winner_index] ?> points.<br>
                            Would you like to continue playing or reset the game?
                        </div>
                        <div class="modal-footer">
                            <button type="submit" name="confirm_reset" class="btn btn-danger">Reset Game</button>
                            <a href="?continue=1" class="btn btn-secondary">Continue Playing</a>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        <?php endif; ?>

        <!-- Add/Subtract Points Modal -->
        <div class="modal fade" id="addPointsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <form method="post" class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Enter Round Points</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <?php foreach ($_SESSION['scores'] as $i => $_): ?>
                            <div class="mb-3">
                                <label class="form-label"><?= $_SESSION['team_names'][$i] ?> (Team <?= $i + 1 ?>)</label>
                                <div class="input-group">
                                    <div class="btn-group toggle-btn me-2" role="group">
                                        <input type="radio" class="btn-check" name="signs[<?= $i ?>]" id="neg<?= $i ?>" value="negative">
                                        <label class="btn btn-outline-danger rounded-pill" for="neg<?= $i ?>">−</label>

                                        <input type="radio" class="btn-check" name="signs[<?= $i ?>]" id="pos<?= $i ?>" value="positive" checked>
                                        <label class="btn btn-outline-success rounded-pill" for="pos<?= $i ?>">+</label>
                                    </div>
                                    <input type="number" name="round_points[<?= $i ?>]" class="form-control" value="0" required>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" name="update_scores" class="btn btn-primary">Submit Round</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Reset Confirmation Modal -->
        <div class="modal fade" id="resetConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <form method="post" class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Are you sure?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        This will reset all scores and game settings.
                    </div>
                    <div class="modal-footer">
                        <button type="submit" name="confirm_reset" class="btn btn-danger">Yes, Reset</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Rename Teams Modal -->
        <div class="modal fade" id="renameTeamsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <form method="post" class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rename Teams</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <?php foreach ($_SESSION['team_names'] as $i => $name): ?>
                            <div class="mb-3">
                                <label class="form-label"><?= $_SESSION['team_names'][$i] ?> (Team <?= $i + 1 ?>)</label>
                                <input type="text" name="team_names[<?= $i ?>]" class="form-control" value="<?= htmlspecialchars($name) ?>">
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" name="rename_teams" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>

    <?php endif; ?>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
