/// <reference path="jquery.d.ts" />
/// <reference path="knockout.d.ts" />
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

ko.bindingHandlers['accordion'] = {
    init: function (element, valueAccessor) {
        var options = valueAccessor() || {};
        $(element)['accordion'](options);
    }
};
ko.bindingHandlers['jqTabs'] = {
    init: function (element, valueAccessor) {
        var options = valueAccessor() || {};
        setTimeout(function () {
            $(element)['tabs'](options);
        }, 0);
    }
};

function exportSpells(dest) {
    $.get('./resources/spells.csv', function (raw) {
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

var Squad = (function () {
    function Squad(squad) {
        this.name = ko.observable(squad.name);
        this.quantity = ko.observable(squad.quantity);
    }
    Squad.Create = function (name, quantity) {
        return new Squad({ name: name, quantity: quantity });
    };
    return Squad;
})();

var MagicItem = (function () {
    function MagicItem() {
        this.name = ko.observable(null);
    }
    return MagicItem;
})();

;

var Commander = (function () {
    function Commander(that) {
        this.name = ko.observable(that.name);
        this.squads = ko.observableArray(that.squads);
        this.items = ko.observableArray([]);
    }
    Commander.prototype.addSquad = function () {
        this.squads.push(Squad.Create('', 0));
    };
    Commander.prototype.addItem = function () {
        this.items.push(new MagicItem);
    };
    return Commander;
})();

;

var Blessing = (function () {
    function Blessing() {
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
    return Blessing;
})();

var Nation = (function () {
    function Nation(that) {
        this.nationNumber = ko.observable(that.nationNumber);
        this.commanders = ko.observableArray(that.commanders);
        this.index = (Nation.indexStatic++);
    }
    Nation.prototype.addCommander = function () {
        this.commanders.push(new Commander({ name: '', squads: [] }));
    };
    Nation.prototype.clearCommanders = function () {
        this.commanders.removeAll();
    };
    Nation.indexStatic = 1;
    return Nation;
})();
;

;

function makeMap(info, continuation) {
    $.get('./resources/battle.map', function (rawMap) {
        var lines = [];
        var i;
        for (i = 0; i < 2; ++i) {
            var nation = info.nations[i];
            var land = [15, 22][i];

            // Units first
            lines.push(sprintf('#specstart %u %u', nation.nationNumber(), land));
            lines.push(sprintf('#land %u', land));
            [].forEach.call(nation.commanders(), function (c) {
                lines.push(sprintf('#commander "%s"', c.name()));
                [].forEach.call(c.items(), function (item) {
                    lines.push(sprintf('#additem "%s"', item.name()));
                });
                [].forEach.call(c.squads(), function (squad) {
                    var num = Number(squad.name());
                    if (isNaN(num)) {
                        // must be a name
                        lines.push(sprintf('#units %u "%s"', squad.quantity(), squad.name()));
                    } else {
                        // specified by number
                        lines.push(sprintf('#units %u %u', squad.quantity(), squad.name()));
                    }
                });
            });

            // Blessing next
            lines.push(sprintf('#god %u "Sage"', nation.nationNumber()));
            for (var key in nation.blessing) {
                if (nation.blessing[key]() > 0) {
                    lines.push(sprintf('#mag_%s %u', key, nation.blessing[key]()));
                }
            }
        }
        continuation(rawMap + lines.join('\r\n'));
    });
}

$(function () {
    var info = {
        nations: [
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
        alert('Usage: save this map file to your Dom4 maps directory (e.g. c:\\Program Files\\Dominions4\\maps). It will create a new map called Battleground based on Talis. Start a new game using this map, and choose the same nations that you set up in this editor. By default these are EA Arco and EA Ermor, which you can auto-select and set to human by pressing Shift-H, Shift-T on the nation selection screen. Click through the pretender screens and start the game--you will have the units you entered in setup.');
        makeMap(info, function (map) {
            return download("battle.map", map);
        });
    });
    //downloadButton('#btnMod', "battle.dm", "This is the mod");
});
