// ==UserScript==
// @name         CTD Upgrade
// @namespace    https://github.com/dev-101010/ctdupgrade
// @version      0.2
// @description  CTD Tower upgrade
// @author       dev-101010
// @match        https://www.c-td.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=c-td.de
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     STYLE1 https://raw.githubusercontent.com/dev-101010/ctd-tower-upgrade/main/style.css
// ==/UserScript==

GM_addStyle (GM_getResourceText("STYLE1"));

(function() {
    'use strict';

    const ctdUpgrade = {
        colors:["#FF0000","#0000FF","#008000","#FFFF00","#ff8400","#91048d","#7FFFD4","#848484"],
        gameRunning:false,
        lvlUpPoints:0,
        lvlUpNeededPoints:5,
        buttons:[],
        selectors:[],
        cells:[],
        toDo:[],
        currentSelected:-1,
        reset: function () {
            this.gameRunning = true;
            this.lvlUpPoints=0;
            this.lvlUpNeededPoints=5;
            this.currentSelected=-1;
            this.buttons=[];
            this.toDo=[];
            for(const selector of this.selectors) {
                selector.style.display = 'none';
            }
        },
    };

    ctdUpgrade.ctdUpgradeToDosChange = (event) => {
        if(ctdUpgrade.currentSelected < 0) return;
        if(event.buttons === 1 && !event.ctrlKey) {
            const type = ctdUpgrade.currentSelected;
            const targetID = parseInt(event.target.id.split('_')[1]);
            event.target.style.backgroundColor = ctdUpgrade.colors[type];
            ctdUpgrade.toDo[targetID] = ctdUpgrade.buttons[type];
        }
        if(event.buttons === 1 && event.ctrlKey) {
            const targetID = parseInt(event.target.id.split('_')[1]);
            event.target.style.backgroundColor = "#FFFFFF";
            ctdUpgrade.toDo[targetID] = null;
        }
    }

    ctdUpgrade.createGrid = (parent) => {
        const main = document.createElement('div');
        main.className = 'ctdUpgrade';

        const selectors = document.createElement('div');
        selectors.className = 'ctdUpgradeSelectors';
        for (let i = 0; i < 8; i++) {
            const cell = document.createElement('div');
            cell.id = "ctdUpgradeSelector_"+i;
            if(i === 0) cell.style.border = "1px solid white";
            cell.addEventListener("mouseup", (event) => {
                for(const element of ctdUpgrade.selectors) {
                    element.style.border = "1px solid black";
                }
                event.target.style.border = "1px solid white";
                ctdUpgrade.currentSelected = parseInt(event.target.id.split('_')[1]);
            });
            cell.style.backgroundColor = ctdUpgrade.colors[i];
            ctdUpgrade.selectors.push(cell);
            selectors.appendChild(cell);
        }
        main.appendChild(selectors);

        const grid = document.createElement('div');
        grid.className = 'ctdUpgradeToDos';
        for (let i = 0; i < 20; i++) {
            const cell = document.createElement('div');
            cell.id = "ctdUpgradeToDos_"+i;
            cell.addEventListener("mousedown", ctdUpgrade.ctdUpgradeToDosChange);
            cell.addEventListener("mouseenter", ctdUpgrade.ctdUpgradeToDosChange);
            ctdUpgrade.cells.push(cell);
            grid.appendChild(cell);
        }
        main.appendChild(grid);

        parent.appendChild(main);
    };

    ctdUpgrade.pointsChanged = () => {
        const upgrade = ctdUpgrade.toDo.shift();
        let lastCell = null;
        let count = 0;
        const last = ctdUpgrade.cells.length-1;

        for (const element of ctdUpgrade.cells) {
            if(lastCell != null) lastCell.style.backgroundColor = element.style.backgroundColor;
            if(count == last) element.style.backgroundColor = "#FFFFFF";
            lastCell = element;
            count++;
        }

        if(!upgrade) return;
        upgrade.click();
        console.log(upgrade.id);
    }

    window.addEventListener("load", () => {

        const gameContainerTowerConfig = document.getElementById("gameContainerTowerConfig");
        if(!gameContainerTowerConfig) return;
        const gameContainerUpgrade = document.getElementById("gameContainerUpgrade");
        if(!gameContainerUpgrade) return;
        const gameContainerOffline = document.getElementById("gameContainerOffline");
        if(!gameContainerOffline) return;
        const cardHeader = gameContainerUpgrade.getElementsByClassName("card-header")[0];
        if(!cardHeader) return;
        const cardBody = gameContainerUpgrade.getElementsByClassName("card-body")[0];
        if(!cardBody) return;

        ctdUpgrade.createGrid(gameContainerTowerConfig);

        ctdUpgrade.reset();

        const gameContainerOfflineCallback = (mutationList, observer) => {
            if(ctdUpgrade.gameRunning && gameContainerOffline.style.display !== 'none') {
                ctdUpgrade.reset();
            }
            if(!ctdUpgrade.gameRunning && gameContainerOffline.style.display === 'none') {
                ctdUpgrade.gameRunning = true;
            }
        }

        const cardBodyCallback = (mutationList, observer) => {

            const buttonList = cardBody.getElementsByClassName("upgradeCard");
            if(!buttonList) return;

            for (const element of buttonList) {
                if(element.style.display === 'none') continue;
                if(ctdUpgrade.buttons.includes(element)) continue;
                const nameElem = element.getElementsByClassName("uname")[0];
                const text = nameElem ? nameElem.innerText : "Unknown";
                const selector = ctdUpgrade.selectors[ctdUpgrade.buttons.length];
                if(selector){
                    selector.style.display = '';
                    selector.innerHTML = text;
                }
                ctdUpgrade.buttons.push(element);
            }

        }

        const cardHeaderCallback = (mutationList, observer) => {

            if(ctdUpgrade.buttons.length <= 0) return;

            const upg = document.getElementById("upgradePrice");
            if(!upg) return;
            const text = upg.innerText;
            if(!text.includes(' / ')) return;
            const [lup,lunp] = text.split(' / ');
            if(parseInt(lup) == ctdUpgrade.lvlUpPoints) return;
            [ctdUpgrade.lvlUpPoints,ctdUpgrade.lvlUpNeededPoints] = [parseInt(lup),parseInt(lunp)];
            if(parseInt(ctdUpgrade.lvlUpPoints) <= 0 || parseInt(ctdUpgrade.lvlUpPoints) < parseInt(ctdUpgrade.lvlUpNeededPoints)) return;
            ctdUpgrade.pointsChanged();
        }

        const config = { attributes: true, childList: true, subtree: true };

        new MutationObserver(cardHeaderCallback).observe(cardHeader, config);

        new MutationObserver(cardBodyCallback).observe(cardBody, config);

        new MutationObserver(gameContainerOfflineCallback).observe(gameContainerOffline, config);
    });

})();
