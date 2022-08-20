const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// configure express
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const YOUR_DOMAIN = process.env.URL || "http://localhost:3000";
const PORT = process.env.PORT || 3000;

console.log(YOUR_DOMAIN);

// This is your test secret API key.
const stripe = require("stripe")(process.env.TOKEN);

app.get("/", (req, res) => {
  res.render("donate");
});

app.get("/success", (req, res) => {
  res.render("success");
});

//

app.post("/checkout", async (req, res) => {
  const { amount, donationtype, donationTo } = req.body;

  let amountreplaced = amount.replace(".", "");
  console.log(amountreplaced);
  if (donationtype == "subscription") {
    url = await subscriptionDonate(amountreplaced, donationTo);
  }

  if (donationtype == "onetime") {
    url = await onetimeDonate(amountreplaced, donationTo);
  }

  res.redirect(303, url);
});

// Recorrente
async function subscriptionDonate(amount, donationTo) {
  const session = await stripe.checkout.sessions.create({
    // prettier-ignore
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: amount,
          recurring: {
            interval: "month"
          },
          product_data: {
            name: `Doaçao recorrente para: ${donationTo}`,
            images: [
              'https://pazinternational.org/wp-content/uploads/2021/12/barco1.png'
            ],
            metadata:
              // prettier-ignore
              {
                "donationTo": donationTo,
              },
          },
        },
        quantity: 1,
        description: donationTo,
      },
    ],
    mode: "subscription", //"payment"
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  return session.url;
}

// Unica
async function onetimeDonate(amount, donationTo) {
  const session = await stripe.checkout.sessions.create({
    // prettier-ignore
    line_items: [
      {
        quantity: 1,
        description: 'Descriçao aqui',
        price_data: {
          currency: 'brl',
          unit_amount: amount,
          product_data: {
            name: `Doaçao única para: ${donationTo}`,
            images: [
              'https://pazinternational.org/wp-content/uploads/2021/12/barco1.png'
            ],
            metadata:
              // prettier-ignore
              {
                "name": "Fulano",
                "Para": "Doaçao para testes Metadata price_data",
              },
          },
        },
      },
    ],
    mode: "payment",
    submit_type: "donate",
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
    metadata:
      // prettier-ignore
      {
        "name": "Fulano",
        "Para": "Doaçao para testes session",
      },
  });

  return session.url;
}

app.get("/health", async (req, res) => {
  res.status(200).send("health");
});

//
app.listen(PORT, () => {
  console.log(`Criador de ambientes - PORTA: ${PORT}`);
});
