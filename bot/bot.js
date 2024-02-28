const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

mongoose.connect("mongodb://localhost:27017/gifatDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    telegram_id: String,
    telegram_first_name: String,
    telegram_last_name: String,
    telegram_username: String,
    offset: String,
    gifs: [{ type: Schema.Types.ObjectId, ref: "GIF" }],
  },
  {
    timestamps: true,
  }
);

const gifSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    file_id: String,
    file_unique_id: String,
    tag: { type: String, text: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const User = new mongoose.model("User", userSchema);
const GIF = new mongoose.model("GIF", gifSchema);

let preparedGIFs = [
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ",
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ",
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ",
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ",
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ",
  "CgACAgQAAxkBAAIB92XfKRh2lCT6cZJ26kIoDLBuZw-wAAKyFAACQ0c5UF5jRgNs5QtLNAQ"
]

let errorGIFs = []
for (let i = 3; i < preparedGIFs.length; i++) {
  errorGIFs.push({
    type: "gif",
    id: i + 1,
    gif_file_id: preparedGIFs[i],
  });
}

let noGIFs = [];
for (let i = 0; i < 3; i++) {
  noGIFs.push({
    type: "gif",
    id: i + 1,
    gif_file_id: preparedGIFs[i],
  });
}


let offset = 1;
let queryCondition = {};

const botUsername = "gifat_bot"

bot.on("message", (msg) => {
  userId = msg.from.id
  userFirstName = msg.from.first_name

  if (!msg.animation) {
    if (msg.text === "/start") {
      User.findOne({ telegram_id: msg.from.id }, (err, foundUser) => {
        if (err) {
          console.log(err);
          bot.sendMessage(
            msg.chat.id,
            "😣 متآسفانه در حال حاضر ربات در دسترس نیست، لطفاً‌ چند دقیقه دیگر دوباره امتحان کنید 🙏🏻"
          );
        } else {
          if (!foundUser) {
            const newUser = new User({
              _id: new mongoose.Types.ObjectId(),
              telegram_id: msg.from.id,
              telegram_first_name: msg.from.first_name,
              telegram_last_name: msg.from.last_name,
              telegram_username: msg.from.username,
            });
            newUser.save().then(() => {
              bot.sendMessage(userId, `👋 سلام ${userFirstName} \n 🤗 خیلی خوش اومدی \n 🤟 گیف‌های مورد علاقه‌ت رو اینجا برام بفرست و اگه دوست داشتی بهشون برچسب بزن تا بعداً توی چت‌ها با دستور @${botUsername} بتونی خیلی سریع به همه گیف‌هات دسترسی پیدا کنی! \n 😎 برای شروع یکی از گیف‌هات رو برام ارسال کن`)
            });
          } else {
            bot.sendMessage(userId, `👋 سلام  ${userFirstName}، از دیدن دوباره‌ت خیلی خوشحالم 😃`)
          }
        }
      });
    } else if (msg.text === "🔖 برچسب زدن") {
      bot.sendMessage(
        msg.chat.id,
        "📝 لطفاً‌ عبارت مورد نظرت رو برام بفرست 🙏🏻",
        {
          reply_markup: {
            force_reply: true,
            input_field_placeholder:
              "ترکیب متن ایموجی مثل: That's waht she said 😂",
          },
          reply_to_message_id: msg.message_id,
        }
      );
    } else if (msg.text === "👊🏻 ارسال یک گیف دیگر") {
      bot.sendMessage(msg.chat.id, "لطفاً ‌گیف مورد علاقه‌ت رو برام بفرست 🙏🏻", {
        reply_markup: { remove_keyboard: true },
      });
    } else {
      User.findOne({ telegram_id: msg.from.id })
        .populate("gifs")
        .exec((err, foundUser) => {
          if (err) {
            console.log(err);
            bot.sendMessage(
              msg.chat.id,
              "😣 متآسفانه در حال حاضر ربات در دسترس نیست، لطفاً‌ چند دقیقه دیگر دوباره امتحان کنید 🙏🏻"
            );
          } else {
            if (foundUser) {
              id = foundUser.gifs[foundUser.gifs.length - 1]._id;
              GIF.findOne({ _id: id }, (err, foundGIF) => {
                if (err) {
                  bot.sendMessage(
                    msg.chat.id,
                    "😣 متآسفانه در حال حاضر ربات در دسترس نیست، لطفاً‌ چند دقیقه دیگر دوباره امتحان کنید 🙏🏻"
                  );
                } else {
                  if (!foundGIF) {
                    bot.sendMessage(
                      msg.chat.id,
                      "😣 متآسفانه در حال حاضر ربات در دسترس نیست، لطفاً‌ چند دقیقه دیگر دوباره امتحان کنید 🙏🏻"
                    );
                  } else {
                    foundGIF.tag = msg.text;
                    foundGIF.save().then(() => {
                      bot.sendMessage(
                        msg.chat.id,
                        "🔖 گیف شما برچسب زده شد 👍🏻 \n  (برای ویرایش برجسب می‌تونی دوباره اون رو برام بنویسی و  بفرستی 😃) \n 😎 باز هم می‌تونی برام گیف بفرستی تا ذخیره‌شون کنم",
                        {
                          reply_to_message_id: msg.message_id,
                          reply_markup: JSON.stringify({
                            keyboard: [
                              [
                                { text: "👊🏻 ارسال یک گیف دیگر" },
                              ],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                            force_reply: true,
                          }),
                        }
                      );
                    });
                  }
                }
              });
            }
          }
        });
    }
  } else {
    User.findOne({ telegram_id: msg.from.id })
      .populate({
        path: "gifs",
        match: { file_unique_id: msg.document.file_unique_id },
      })
      .exec((err, foundUser) => {
        if (err) {
          console.log(err);
          bot.sendMessage(
            msg.chat.id,
            "😣 متآسفانه در حال حاضر ربات در دسترس نیست، لطفاً‌ چند دقیقه دیگر دوباره امتحان کنید 🙏🏻"
          );
        } else {
          if (foundUser) {
            if (foundUser.gifs.length !== 0) {
              bot.sendMessage(
                msg.chat.id,
                "این گیف قبلاً ذخیره شده 😅 \n می‌خوای باهاش چیکار کنی؟ 🙃",
                {
                  reply_to_message_id: msg.message_id,
                  reply_markup: JSON.stringify({
                    keyboard: [
                      [
                        { text: "🔖  ویرایش برجسب" },
                        { text: "❌ حذف گیف" },
                        { text: "👊🏻 ارسال یک گیف دیگر" },
                      ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                  }),
                }
              );
            } else {
              const newGIF = new GIF({
                _id: new mongoose.Types.ObjectId(),
                file_id: msg.document.file_id,
                file_unique_id: msg.document.file_unique_id,
                tag: "",
                owner: foundUser._id,
              });
              newGIF.save().then(() => {
                foundUser.gifs.push(newGIF._id);
                foundUser.save();
              });
              bot.sendMessage(
                msg.chat.id,
                "🎉 گیف شما ثبت شد \n 😊 حالا می‌تونی یکی از گزینه‌های زیر رو انتخاب کنی",
                {
                  reply_markup: JSON.stringify({
                    keyboard: [
                      [
                        { text: "🔖 برچسب زدن" },
                        { text: "👊🏻 ارسال یک گیف دیگر" },
                      ],
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    force_reply: true,
                  }),
                  reply_to_message_id: msg.message_id,
                }
              );
            }
          }
        }
      });
  }
});

bot.on("inline_query", (msg) => {
  User.findOne({ telegram_id: msg.from.id })
    .select("offset")
    .exec((err, foundOffset) => {
      if (err) {
        console.log(err);
        bot.answerInlineQuery(msg.id, errorGIFs, {
          cache_time: 1,
        });
      } else {
        if (!foundOffset) {
          bot.answerInlineQuery(msg.id, noGIFs, {
            cache_time: 1,
          });
        } else {
          offset = parseInt(foundOffset);
          if (offset !== 1) {
            offset = parseInt(msg.offset);
          }
          if (msg.offset === "") {
            offset = 1;
          }
          if (msg.query === "") {
            queryCondition = {
              path: "gifs",
              limit: 50,
              skip: (offset - 1) * 50,
              options: { sort: { createdAt: -1 } },
            };
          } else {
            queryCondition = {
              path: "gifs",
              match: { $text: { $search: msg.query } },
              limit: 50,
              skip: (offset - 1) * 50,
              options: { sort: { createdAt: -1 } },
            };
          }
          User.findOne({ telegram_id: msg.from.id })
            .populate(queryCondition)
            .exec((err, foundUser) => {
              if (err) {
                console.log(err);
                bot.answerInlineQuery(msg.id, errorGIFs, {
                  cache_time: 1,
                });
              } else {
                if (!foundUser) {
                  bot.answerInlineQuery(msg.id, noGIFs, {
                    cache_time: 1,
                  });
                } else {
                  offset = parseInt(foundUser.offset);
                  if (offset !== 1) {
                    offset = parseInt(msg.offset);
                  }
                  if (msg.offset === "") {
                    offset = 1;
                  }
                  const foundGIFs = foundUser.gifs;
                  if (foundGIFs.length === 0) {
                    if (offset === 1) {
                      bot.answerInlineQuery(msg.id, noGIFs, {
                        cache_time: 1,
                      });
                    }
                    offset = "";
                    foundUser.offset = offset;
                    foundUser.save();
                  } else {
                    let resultGIFs = [];
                    for (let i = 0; i < foundGIFs.length; i++) {
                      resultGIFs.push({
                        type: "gif",
                        id: foundGIFs[i]._id,
                        gif_file_id: foundGIFs[i].file_id,
                      });
                    }
                    offset += 1;
                    foundUser.offset = offset;
                    foundUser.save();
                    bot.answerInlineQuery(msg.id, resultGIFs, {
                      cache_time: 1,
                      is_personal: true,
                      next_offset: offset,
                    });
                  }
                }
              }
            });
        }
      }
    });
});

bot.on("callback_query", (data) => {
  if (data.data === "tag") {
    bot
      .deleteMessage(data.message.chat.id, data.message.message_id)
      .then(() => {
        bot.sendMessage(
          data.message.chat.id,
          "📝 لطفاً‌ عبارت مورد نظرت رو برام بفرست 🙏🏻",
          {
            reply_markup: {
              force_reply: true,
              input_field_placeholder:
                "ترکیب متن ایموجی مثل: That's waht she said 😂",
            },
          }
        );
      });
  } else if (data.data === "next") {
    bot
      .deleteMessage(data.message.chat.id, data.message.message_id)
      .then(() => {
        bot.sendMessage(
          data.message.chat.id,
          "لطفاً ‌گیف مورد علاقه‌ت رو برام بفرست 🙏🏻"
        );
      });
  }
  bot.answerCallbackQuery(data.id, "", false);
});

bot.on("polling_error", (err) => {
  console.log(err);
});