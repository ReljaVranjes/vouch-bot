const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const config = require('./config.json');
const client = new Discord.Client();
const mongoose = require("mongoose")
var listausera = [];
postoji = 1;
var komentar = "";

//povezi se na bazu
mongoose.connect(config.mongoPass, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//modeli

const Data = require("./models/data.js");

async function f1() {
    var x = await Data.find({ postoji: 1 }).exec();
    for (i = 0; i < x.length; i++) {

        if (listausera.includes(x[i].userID) == false) {
            listausera.push(x[i].userID);
        }
    }
    console.log(listausera);
}

client.once('ready', () => {
    console.log('Ready!');

});

//verifikacija





client.on('message', message => {

    f1();


    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const user = message.mentions.users.first();
    const embed = new Discord.MessageEmbed()
    const p = new Discord.MessageEmbed()
    const n = new Discord.MessageEmbed()

    if (command === 'help') {
        const help = new Discord.MessageEmbed()
        help.setTitle("Hello " + message.author.username + ", these are my commands ")
        help.setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png")
        help.setDescription("> `+profile @someone` or `+profile @<id>` \n\n Sees `@someone` / `@<id>`'s profile. \n This includes seeing their DiscordTag, User ID, Avatar, number of positive/negative vouches and the last 5 comments they received. \n\n > `+p @someone <comment>` or `+n @someone <comment>` \n\n  Leaves `@someone` a positive or a negative vouch and a `<comment>`. \n Although non-mandatory, leaving a `<comment>` is encouraged.")
        help.setColor("#2f9ffa")
        message.channel.send(help)
    }

    if (message.content.length == 2) { return; }

    if (command === 'p' && args[0][0] + args[0][1] != "<@") { return; }

    else if (command === 'p' && user.id == message.author.id) {
        const kk = new Discord.MessageEmbed()
        kk.setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png")
        kk.setDescription("You can't vouch for yourself.")
        kk.setTitle("Vouch bot")
        kk.setColor("#2f9ffa")
        message.channel.send(kk)
    }

    else if (command === 'p' && listausera.includes(user.id) == false) {


        var x = message.content.slice(prefix.length + 3).trim();
        for (i = 1; i < args.length; i++) {
            komentar += args[i] + " "

        }

        Data.findOne({
            userID: user.id
        }, (err, data) => {
            if (err) console.log(err);
            if (!data) {
                const newData = new Data({
                    name: client.users.cache.get(user.id).username,
                    userID: user.id,
                    pozitivni_vouch: 1,
                    negativni_vouch: 0,
                    postoji: postoji,
                    komentari: komentar + ":white_check_mark:",
                    verifikacija: ":x:",


                })
                newData.save().catch(err => console.log(err));
                p.setTitle("Vouch bot")
                p.setColor("#2f9ffa")
                p.setThumbnail(user.displayAvatarURL({ dynamic: true }))
                p.setDescription("You have successfully left a positive vouch for " + "<@" + user.id + "> \n\n **To see " + user.username + "'s profile, type: **\n `+profile <@" + user.id + "> `")
                message.channel.send(p)

            }
            komentar = "";

        })

    }
    else if ((command === 'p' && listausera.includes(user.id) == true)) {
        var x = message.content.slice(prefix.length + 3).trim();
        for (i = 1; i < args.length; i++) {
            komentar += args[i] + " "

        }
        async function lal() {
            await Data.findOneAndUpdate({ userID: user.id }, { $inc: { pozitivni_vouch: 1 } })
            await Data.findOneAndUpdate({ userID: user.id }, { $push: { komentari: komentar + ":white_check_mark:" } })
            p.setTitle("Vouch bot")
            p.setColor("#2f9ffa")
            p.setThumbnail(user.displayAvatarURL({ dynamic: true }))
            p.setDescription("You have successfully left a positive vouch for " + "<@" + user.id + "> \n\n **To see " + user.username + "'s profile, type: **\n `+profile <@" + user.id + "> `")

            message.channel.send(p)

            komentar = "";
        }
        lal();


    }
    if (command === 'n' && args[0][0] + args[0][1] != "<@") {
        return;
    }

    else if (command === 'n' && listausera.includes(user.id) == false) {

        var x = message.content.slice(prefix.length + 3).trim();
        for (i = 1; i < args.length; i++) {
            komentar += args[i] + " "
        }

        Data.findOne({
            userID: user.id
        }, (err, data) => {
            if (err) console.log(err);
            if (!data) {
                const newData = new Data({
                    name: client.users.cache.get(user.id).username,
                    userID: user.id,
                    pozitivni_vouch: 0,
                    negativni_vouch: 1,
                    postoji: postoji,
                    komentari: komentar + ":x:",
                    verifikacija: ":x:",

                })
                newData.save().catch(err => console.log(err));
                n.setTitle("Vouch bot")
                n.setColor("#2f9ffa")
                n.setThumbnail(user.displayAvatarURL({ dynamic: true }))
                n.setDescription("You have successfully left a negative vouch for " + "<@" + user.id + "> \n\n **To see " + user.username + "'s profile, type: **\n  `+profile <@" + user.id + "> `")
                message.channel.send(n)

            }
            komentar = "";
        })
    }
    else if (command === 'n' && listausera.includes(user.id) == true) {
        var x = message.content.slice(prefix.length + 3).trim();
        for (i = 1; i < args.length; i++) {
            komentar += args[i] + " "
        }

        async function lol() {
            await Data.findOneAndUpdate({ userID: user.id }, { $inc: { negativni_vouch: 1 } })
            await Data.findOneAndUpdate({ userID: user.id }, { $push: { komentari: komentar + ":x:" } })
            n.setTitle("Vouch bot")
            n.setColor("#2f9ffa")
            n.setThumbnail(user.displayAvatarURL({ dynamic: true }))
            n.setDescription("You have successfully left a negative vouch for " + "<@" + user.id + "> \n\n **To see " + user.username + "'s profile, type: **\n `+profile <@" + user.id + "> `")

            message.channel.send(n)
            komentar = ""
        }
        lol();
    }

    if (command === "banner" && args.length == 1) {

        async function baner() {

            await Data.updateOne(
                {userID: message.author.id}, 
                {baner: args[0] },

            )}
        baner();

        const embed = new Discord.MessageEmbed()
        embed.setTitle("Vouch bot")
        embed.setColor("#2f9ffa")
        embed.setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png")
        embed.setDescription("You have successfully placed banner for your profile. If it isn't showing , your link wasn't good.")
        message.channel.send(embed)
    }
    if(command === "removebanner")
    {
        
        async function rb(){
        await Data.updateOne({userID:message.author.id},{$unset: {baner:" "} })
        }
        rb()

        const embed = new Discord.MessageEmbed()
        embed.setTitle("Vouch bot")
        embed.setColor("#2f9ffa")
        embed.setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png")
        embed.setDescription("You have successfully removed your banner.")
        message.channel.send(embed)

    }


    if (command === 'profile' && args[0][0] + args[0][1] != "<@") {
        return;
    }

    else if (command === 'profile' && listausera.includes(user.id) == false) {

        embed.setTitle(`${user.username}'s Profile`)
        embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
        embed.setDescription("**Discord Tag :** <@" + user.id + ">" + "\n **User ID :** `" + user.id + "`\n\n **This user has no information available. **")

        embed.setColor("#2f9ffa")

        message.channel.send(embed);


    }

    else if (command === 'profile' && listausera.includes(user.id) == true) {

        async function kix() {
            var kom = []

            x = await Data.find({ userID: user.id })

            embed.setTitle(`${user.username}'s Profile`)
            embed.setDescription("**Discord Tag :** <@" + user.id + ">" + "\n **User ID :** " + user.id + " \n **Verified:** " + x[0].verifikacija)
            embed.addField("__**Vouch Information**__", "**Positive : **`" + x[0].pozitivni_vouch + "`\n **Negative : **`" + x[0].negativni_vouch + "`\n **Total : **`" + (x[0].negativni_vouch + x[0].pozitivni_vouch + "`"))
            embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
            embed.setColor("#2f9ffa")
            embed.setImage(x[0].baner)

            for (var i = x[0].komentari.length - 1; i >= 0; i--) {
                if (x[0].komentari[i] != ":white_check_mark:" && x[0].komentari[i] != ":x:") {
                    kom.push(x[0].komentari[i])
                }

            }
            if (kom.length < 5) {
                embed.addField("**Last 5 comments**", "User hasn't reached 5 comments yet.")
            }
            else {

                embed.addField("__**Last 5 comments**__", "\n**1. " + " " + kom[0] + "**" + "\n**2." + " " + kom[1] + "**" + "\n**3. " + " " + kom[2] + "**" + "\n**4. " + " " + kom[3] + "**" + "\n**5. " + " " + kom[4] + "**");

            }
            console.log(kom)
            message.channel.send(embed)
        }
        kix();
    }

});

client.login(token);