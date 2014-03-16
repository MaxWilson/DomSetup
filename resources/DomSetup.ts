/// <reference path="jquery.d.ts" />
/// <reference path="knockout.d.ts" />

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

ko.bindingHandlers['accordion'] = {
    init: function (element) {
        $(element)['accordion']();
    }
}
ko.bindingHandlers['tabs'] = {
    init: function (element) {
        $(element)['accordion']();
    }
}

function exportSpells(dest) {
    $.get('/resources/spells.csv', function (raw) {
        var lines = raw.split('\n');
        function indexSpell(dest, school, level, spell) {
            if (!dest[school]) {
                dest[school] = [];
            }
            if (!dest[school][level]) {
                dest[school][level] = [];
            }
            dest[school][level].push(spell);
        }
        var allspells = {};
        for (var i = 1; i < lines.length; ++i) {
            var line = lines[i].trim();
            var entries = line.split(',');
            var number = entries[0];
            var name = entries[1];
            var school = entries[2];
            var level = entries[3];
            if (level && level > 0) {
                indexSpell(allspells, school, level, { num: number, name: name });
            }
        }
        for (var school in allspells) {
            for (var level in allspells[school]) {
                var header = document.createElement("h2");
                dest.append($('<h2>').text(school + level));
                for (var i in allspells[school][level]) {
                    var spell = allspells[school][level][i];
                    $('#SpellTab').append($('<li>').text(spell.name));
                }
            }
        }
    });
}

interface SquadArgs {
    name: string;
    quantity: number;
}

class Squad {
    name: KnockoutObservable<string>;
    quantity: KnockoutObservable<number>;
    constructor(squad: SquadArgs) {
        this.name = ko.observable(squad.name);
        this.quantity = ko.observable(squad.quantity);
    }
    static Create(name: string, quantity: number) {
        return new Squad({ name: name, quantity: quantity });
    }
}

interface CommanderArgs {
    name: string;
    squads: Squad[];
};

class Commander {
    name: KnockoutObservable<string>;
    items: KnockoutObservableArray<string>;
    squads: KnockoutObservableArray<Squad>;
    constructor (that : CommanderArgs) {
        this.name = ko.observable(that.name);
        this.squads = ko.observableArray(that.squads);
        this.items = ko.observableArray([]);
    }
    addSquad() {
        this.squads.push(Squad.Create('', 0));
    }
    addItem() {
        this.items.push(null);
    }
}

interface NationArgs {
    nationNumber: number;
    commanders: Commander[];
};

class Blessing {
    earth: KnockoutObservable<number>;
    air: KnockoutObservable<number>;
    fire: KnockoutObservable<number>;
    water: KnockoutObservable<number>;
    nature: KnockoutObservable<number>;
    death: KnockoutObservable<number>;
    astral: KnockoutObservable<number>;
    blood: KnockoutObservable<number>;
    priest: KnockoutObservable<number>;
    constructor() {
        this.earth = ko.observable(0);
        this.air = ko.observable(0);
        this.fire = ko.observable(0);
        this.water = ko.observable(0);
        this.nature = ko.observable(0);
        this.death = ko.observable(0);
        this.astral = ko.observable(0);
        this.blood = ko.observable(0);
        this.priest = ko.observable(0);
    }
}

class Nation {
    index: number;
    nationNumber: KnockoutObservable<number>;
    commanders: KnockoutObservableArray<Commander>;
    blessing: Blessing;
    static indexStatic: number = 1;
    constructor (that : NationArgs) {
        this.nationNumber = ko.observable(that.nationNumber);
        this.commanders = ko.observableArray(that.commanders);
        this.index = (Nation.indexStatic++);
    }
    addCommander(): void {
        this.commanders.push(new Commander({ name: '', squads: [] }));
    }
    clearCommanders() {
        this.commanders.removeAll();
    }
};

interface Definition {
    nations: Nation[];
};

function makeMap(info: Definition, continuation : (string) => void) : void {
    continuation("This is a map");
}

$(function () {
    var info : Definition =
        {
            nations: 
            [
                new Nation({
                    nationNumber: 5,
                    commanders: [
                        new Commander({
                            name: "Melqart",
                            squads: [
                                new Squad({ name: "Great Olm", quantity: 30 }),
                                new Squad({ name: "Hastatus", quantity: 30 }),
                                Squad.Create("Devil", 10)
                            ]
                        })
                    ]
                }),
                new Nation({
                    nationNumber: 6,
                    commanders: [
                        new Commander({
                            name: "Lion King",
                            squads: [
                                new Squad({ name: "Guardian", quantity: 30 }),
                                new Squad({ name: "Soulless", quantity: 30 })
                            ]
                        })
                    ]
                })
            ]
        };
    ko.applyBindings(info);
    $('#btnMap').click(function () {
        makeMap(info, map => download("battle.map", map));
    });
    //downloadButton('#btnMod', "battle.dm", "This is the mod");
});
