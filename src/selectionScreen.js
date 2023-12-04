document.addEventListener('DOMContentLoaded', () => {
    createSelectionScreen();

    document.getElementById('captain-selection').addEventListener('change', handleSelectionChange);
    document.getElementById('ship-selection').addEventListener('change', handleSelectionChange);

    document.getElementById('start-selection-button').addEventListener('click', startGame);

    function createSelectionScreen() {
        const selectionContainer = document.createElement('div');
        selectionContainer.id = 'selection-container';
        selectionContainer.innerHTML = `
            <select id="captain-selection">
                <option value="" disabled selected>Kapitän auswählen</option>
                <option value="captain1">Kapitän 1</option>
                <option value="captain2">Kapitän 2</option>
                <option value="captain3">Kapitän 3</option>
            </select>
            <select id="ship-selection">
                <option value="" disabled selected>Schiffform auswählen</option>
                <option value="ship1">Schiffform 1</option>
                <option value="ship2">Schiffform 2</option>
                <option value="ship3">Schiffform 3</option>
            </select>
            <button id="start-selection-button" disabled>Spiel starten</button>
        `;

        document.body.prepend(selectionContainer);
    }

    function handleSelectionChange() {
        const captainSelected = document.getElementById('captain-selection').value;
        const shipSelected = document.getElementById('ship-selection').value;
        document.getElementById('start-selection-button').disabled = !(captainSelected && shipSelected);
    }

    function startGame() {
        document.getElementById('selection-container').style.display = 'none';
    
        document.getElementById('gameboard-container').style.display = 'flex';
    

        const event = new CustomEvent('gameStart', { 
            detail: { 
                captain: document.getElementById('captain-selection').value, 
                shipForm: document.getElementById('ship-selection').value 
            }
        });
        document.dispatchEvent(event);
    }
});
