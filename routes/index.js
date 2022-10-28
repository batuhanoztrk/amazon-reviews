const express = require("express");
const jsdom = require("jsdom");
const axios = require("axios");

const router = express.Router();
const { JSDOM } = jsdom;

const getReviews = (asin, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_srt?reviewerType=all_reviews&pageNumber=${page}&sortBy=recent`;

      const { data } = await axios(url);

      const dom = new JSDOM(data);

      const { document } = dom.window;

      const reviews = [...document.querySelectorAll('[data-hook="review"]')];

      const _reviews = [];

      for (const review of reviews) {
        const title = review.querySelector('[data-hook="review-title"]>span');

        const comment = review.querySelector(
          'span[data-hook="review-body"]>span'
        );

        const author = review.querySelector("span.a-profile-name");

        let date = review.querySelector('span[data-hook="review-date"]');

        let star = review.querySelector(
          'span.a-icon-alt'
        );

        const isVerifiedPurchase = review.querySelector('[data-hook="avp-badge"]');

        if (date) {
          date = date.textContent;

          if (date.includes("on")) {
            date = date.split("on ");

            if (date.length > 1) {
              date = date[1];
            } else {
              date = null;
            }
          }
        }

        if (star) {
          star = star.textContent;

          star = star.split(" ");

          if (star.length) {
            star = +star[0];
          } else {
            star = null;
          }
        }

        _reviews.push({
          Author: author ? author.textContent : null,
          Title: title ? title.textContent : null,
          Review: comment ? comment.textContent : null,
          Star: star ? star : null,
          "Is Verified Purchase": !!isVerifiedPurchase,
          Date: date ? date : null,
        });
      }

      resolve(_reviews);
    } catch (e) {
      reject(e);
    }
  });
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Amazon Reviews" });
});

router.post("/get-reviews", async (req, res) => {
  try {
    const { asin, pageCount } = req.body;

    const pages = new Array(+pageCount).fill(0);

    const reviews = [];

    for (const [i, v] of pages.entries()) {
      reviews.push(...(await getReviews(asin, i + 1)));
    }

    res.json({
      reviews,
    });
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});

module.exports = router;
