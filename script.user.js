// ==UserScript==
// @name         CTD Upgrade
// @namespace    https://github.com/dev-101010/ctd-tower-upgrade
// @version      0.1
// @description  CTD Tower upgrade
// @author       dev-101010
// @match        https://www.c-td.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=c-td.de
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener("load", () => {
        const ctdUpgrade = {
            lvlUpPoints:0,
            lvlUpNeededPoints:0,
            buttons:[],
        };

        const cardHeader = document.getElementsByClassName("card-header")[0];
        if(!cardHeader) return;
        const cardBody = document.getElementsByClassName("card-body")[0];
        if(!cardBody) return;

        const config = { attributes: true, childList: true, subtree: true };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                const buttonList = cardBody.getElementsByClassName("upgradeCard");
                if(!buttonList) return;
                let buttons = [];
                Array.from(buttonList).forEach((element) => {
                    if(element.style.display === 'none') return;
                    buttons.push(element);
                });
                ctdUpgrade.buttons = buttons;
                if(ctdUpgrade.buttons.length<=0) return;

                if (mutation.type !== "childList") return;
                const upg = document.getElementById("upgradePrice");
                if(!upg) return;
                const text = upg.innerText;
                if(!text.includes(' / ')) return;
                const [lup,lunp] = text.split(' / ');
                if(parseInt(lup) == ctdUpgrade.lvlUpPoints) return;
                [ctdUpgrade.lvlUpPoints,ctdUpgrade.lvlUpNeededPoints] = [parseInt(lup),parseInt(lunp)];

                const upgrade = ctdUpgrade.buttons[Math.floor(Math.random()*ctdUpgrade.buttons.length)]
                if(upgrade == null || parseInt(ctdUpgrade.lvlUpPoints) == 0 || parseInt(ctdUpgrade.lvlUpPoints) < parseInt(ctdUpgrade.lvlUpNeededPoints)) return;
                upgrade.click();
                console.log(upgrade.id);
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(cardHeader, config);
    });

})();

/*const myWindow = window.open("/", "CTD Upgrade Window", "width=500, height=500, left=100, top=100");
        myWindow.document.write("<p>This is 'MsgWindow'. I am 100px wide and 100px tall!</p>");*/
