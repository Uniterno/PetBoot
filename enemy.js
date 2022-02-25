const { Command } = require("discord.js-commando");
const Discord = require("discord.js");
const fs = require("fs");
const rng = require("random-world");

module.exports = class EnemyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "enemy",
      group: "util",
      guildOnly: true,
      memberName: "enemy",
      description: "Spawns new enemy.",
      aliases: "ene",
    });
  }

  run(message, args) {
    args = message.content.split(" ").slice(1);

    let UserID = message.author.id;
    let DateV = new Date();

    var MasterUser = JSON.parse(fs.readFileSync("./PetBoot/settings/user/master.json"));

    if (!registeredUser(MasterUser, UserID)) {
      message.channel.send("I'm sorry! It seems you haven't registered an account yet, to make use of PetBot features you must first register.\nTry using !setname <Your name> to set up your username! This can be changed at any moment!\nUse !pp to read PetBot's Privacy Policy!");
      return;
    }

    if (!!MasterUser[UserID].DailyAttack.Buffs == false) {
      MasterUser[UserID].DailyAttack.Buffs = {
        AngelsRevelation: {
          Enabled: false,
          Ready: false,
        },
      };
    }

    registerToServer(UserID, message.guild.id);

    var Settings = JSON.parse(fs.readFileSync("./PetBoot/settings/master.json"));
    var UserSettings = JSON.parse(fs.readFileSync("./PetBoot/settings/user/vs_new.json"));

    let DifficultySequence = UserSettings[UserID].VSNew.Enemy.DifficultySequence;
    let CurrentEnemy = UserSettings[UserID].VSNew.Enemy;

    let ScoreDifficultyFactor = 1;
    let AverageHitsToKill = 0; // TODO: read from user
    let HitsToKill = 0; // TODO: read from user
    let TotalHPScore = 0; // TODO: read from user
    let LostHP = 0; // TODO: read from user
    let DifficultyScore = (AverageHitsToKill / HitsToKill / (1 - Math.max(LostHP / TotalHPScore, 0.3))) * ScoreDifficultyFactor;

    let FixedFactor = 1;
    let Difficulty = CurrentEnemy.DifficultySequence * DifficultyScore * FixedFactor;

    let NewEnemy = {};

    NewEnemy.DifficultySequence = CurrentEnemy.DifficultySequence + 1;
    NewEnemy.Stats = {};

    // All base are TBD as equipment is added and balance applied
    NewEnemy.Stats.MaxHP = Math.max(1, (100 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Attack = Math.max(1, (15 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Defense = Math.max(0, (2 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Evasion = Math.max(0, (1 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.CriticalChance = Math.max(0, (5 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.CriticalDamage = Math.max(0, (50 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Speed = Math.max(0, (2 + 3 * RandomSign()) * Difficulty);

    NewEnemy.Stats.Events.Diplomacy = Math.max(0, (3 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Events.Martial = Math.max(0, (3 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Events.Stewardship = Math.max(0, (3 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Events.Learning = Math.max(0, (3 + 3 * RandomSign()) * Difficulty);
    NewEnemy.Stats.Events.Prowess = Math.max(0, (3 + 3 * RandomSign()) * Difficulty);

    NewEnemy.CurrentHP = NewEnemy.Stats.MaxHP;

    let MessageToSend = "New enemy has been generated!";
    MessageToSend += "\nMaxHP: " + NewEnemy.Stats.MaxHP;
    MessageToSend += "\nAttack: " + NewEnemy.Stats.Attack;
    MessageToSend += "\nDefense: " + NewEnemy.Stats.Defense;
    MessageToSend += "\nEvasion: " + NewEnemy.Stats.Evasion;
    MessageToSend += "\nCritical Chance: " + NewEnemy.Stats.CriticalChance;
    MessageToSend += "\nCritical Damage: " + NewEnemy.Stats.CriticalDamage;
    MessageToSend += "\nSpeed: " + NewEnemy.Stats.Speed;
    MessageToSend += "\n\n--Event Stats--";
    MessageToSend += "\nDiplomacy: " + NewEnemy.Stats.Events.Diplomacy;
    MessageToSend += "\nMartial: " + NewEnemy.Stats.Events.Martial;
    MessageToSend += "\nStewardship: " + NewEnemy.Stats.Events.Stewardship;
    MessageToSend += "\nLearning: " + NewEnemy.Stats.Events.Learning;
    MessageToSend += "\nProwess: " + NewEnemy.Stats.Events.Prowess;

    if (MessageToSend != "") {
      message.channel.send(MessageToSend);
    }

    // TODO: Add equipment to finalize build

    UserSettings[UserID].VSNew.Enemy = NewEnemy;

    SaveJSON(UserSettings, "./PetBoot/settings/user/vs_new.json");
  }
};

function getRandom(min, max) {
  return rng.integer({ min, max });
}

function registeredUser(MasterUser, UserID) {
  return !!MasterUser[UserID] == true;
}

function SaveJSON(Obj, Path) {
  let toSave = JSON.stringify(Obj, null, "\t");
  fs.writeFileSync(Path, toSave);
}

function registerToServer(UserID, GuildID) {
  let GuildSettings = JSON.parse(fs.readFileSync("./PetBoot/settings/user/serverlist.json"));
  if (!!GuildSettings[GuildID] == false) {
    GuildSettings[GuildID] = [];
  }
  if (!GuildSettings[GuildID].includes(UserID)) {
    GuildSettings[GuildID].push(UserID);
  }
  SaveJSON(GuildSettings, "./PetBoot/settings/user/serverlist.json");
}

function sort_object(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b - a));
}

function RandomSign() {
  return getRandom(0, 100) < 50 ? 1 : -1;
}
