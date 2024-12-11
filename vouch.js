const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const userList = [];
let comment = "";
let exists = 1;

const prefix = process.env.prefix; // Bot command prefix
const token = process.env.token; // Discord bot token
const mongoPass = process.env.mongoPass;

// Connect to MongoDB
mongoose.connect(mongoPass, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Models
const Data = require("./models/data.js");

// Fetch and populate user list
async function populateUserList() {
    const data = await Data.find({ postoji: 1 }).exec();
    for (const user of data) {
        if (!userList.includes(user.userID)) {
            userList.push(user.userID);
        }
    }
    console.log(userList);
}

// Bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Handle commands
client.on('message', (message) => {
    populateUserList();

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const mentionedUser = message.mentions.users.first();
    const helpEmbed = new Discord.MessageEmbed();
    const positiveVouchEmbed = new Discord.MessageEmbed();
    const negativeVouchEmbed = new Discord.MessageEmbed();

    if (command === 'help') {
        helpEmbed
            .setTitle(`Hello ${message.author.username}, these are my commands`)
            .setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png")
            .setDescription("> `+profile @someone` or `+profile @<id>` \n\n View a profile including DiscordTag, User ID, Avatar, number of positive/negative vouches, and the last 5 comments.\n\n > `+p @someone <comment>` or `+n @someone <comment>` \n\n Leave a positive/negative vouch with an optional comment.")
            .setColor("#2f9ffa");
        message.channel.send(helpEmbed);
    }

    if (command === 'p' || command === 'n') {
        if (!mentionedUser || mentionedUser.id === message.author.id) {
            const selfVouchEmbed = new Discord.MessageEmbed()
                .setTitle("Vouch Bot")
                .setDescription("You can't vouch for yourself.")
                .setColor("#2f9ffa")
                .setThumbnail("https://cdn.discordapp.com/attachments/692865174583115776/761149853366484992/VB1.png");
            message.channel.send(selfVouchEmbed);
            return;
        }

        const isPositive = command === 'p';
        const vouchSymbol = isPositive ? ":white_check_mark:" : ":x:";
        const vouchType = isPositive ? "Positive" : "Negative";

        const commentText = args.slice(1).join(" ");
        comment = commentText;

        if (!userList.includes(mentionedUser.id)) {
            const newUser = new Data({
                name: client.users.cache.get(mentionedUser.id).username,
                userID: mentionedUser.id,
                pozitivni_vouch: isPositive ? 1 : 0,
                negativni_vouch: isPositive ? 0 : 1,
                postoji: exists,
                komentari: comment + vouchSymbol,
                verifikacija: ":x:",
            });

            newUser.save().catch((err) => console.log(err));

            positiveVouchEmbed
                .setTitle("Vouch Bot")
                .setDescription(`You have successfully left a ${vouchType.toLowerCase()} vouch for <@${mentionedUser.id}>.\n\n**To view their profile, type:** \n\`+profile <@${mentionedUser.id}>\``)
                .setColor("#2f9ffa")
                .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }));
            message.channel.send(positiveVouchEmbed);
        } else {
            const updateField = isPositive ? "pozitivni_vouch" : "negativni_vouch";
            const updateComment = { $push: { komentari: comment + vouchSymbol } };

            Data.findOneAndUpdate({ userID: mentionedUser.id }, { $inc: { [updateField]: 1 }, ...updateComment }, { new: true })
                .then(() => {
                    positiveVouchEmbed
                        .setTitle("Vouch Bot")
                        .setDescription(`You have successfully left a ${vouchType.toLowerCase()} vouch for <@${mentionedUser.id}>.\n\n**To view their profile, type:** \n\`+profile <@${mentionedUser.id}>\``)
                        .setColor("#2f9ffa")
                        .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }));
                    message.channel.send(positiveVouchEmbed);
                })
                .catch((err) => console.log(err));
        }

        comment = "";
    }

    if (command === "profile") {
        if (!mentionedUser) return;

        if (!userList.includes(mentionedUser.id)) {
            const noInfoEmbed = new Discord.MessageEmbed()
                .setTitle(`${mentionedUser.username}'s Profile`)
                .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
                .setDescription(`**Discord Tag:** <@${mentionedUser.id}>\n**User ID:** \`${mentionedUser.id}\`\n\n**No information available for this user.**`)
                .setColor("#2f9ffa");
            message.channel.send(noInfoEmbed);
            return;
        }

        Data.findOne({ userID: mentionedUser.id })
            .then((data) => {
                const lastComments = data.komentari.slice(-5);
                const profileEmbed = new Discord.MessageEmbed()
                    .setTitle(`${mentionedUser.username}'s Profile`)
                    .setDescription(`**Discord Tag:** <@${mentionedUser.id}>\n**User ID:** ${mentionedUser.id}\n**Verified:** ${data.verifikacija}`)
                    .addField("__**Vouch Information**__", `**Positive:** \`${data.pozitivni_vouch}\`\n**Negative:** \`${data.negativni_vouch}\`\n**Total:** \`${data.pozitivni_vouch + data.negativni_vouch}\``)
                    .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
                    .setImage(data.baner)
                    .setColor("#2f9ffa");

                if (lastComments.length > 0) {
                    profileEmbed.addField("__**Last 5 Comments**__", lastComments.join("\n"));
                } else {
                    profileEmbed.addField("__**Last 5 Comments**__", "No comments available yet.");
                }

                message.channel.send(profileEmbed);
            })
            .catch((err) => console.log(err));
    }
});

client.login(token);
