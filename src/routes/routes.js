const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../models/auth");
const mongoose = require("mongoose");
const slot = require("../models/slotGenerator.model");
const ObjectId = require("mongodb").ObjectID;
var moment = require("moment");
const flash = require("connect-flash");
const doc = require("../models/doctor.model");
docSchema = require("../models/doctor.model");
const USer = require("../models/users");
const Booking = require("../models/appointment.model");
const slotBooking = require("../models/slotBooking.model");

router.get("/", (req, res) => {
  res.render("index", {
    success_msg: req.flash("success_msg"),
    mainTitle: "Medical App",
  });
});

// router.get("/doctors/search", ensureAuthenticated, async (req, res) => {
//   const { searchFilter, searchTreatment } = req.query;
//   let days = [];
//   let daysRequired = 7;
//   for (let i = 0; i <= daysRequired; i++) {
//     days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
//   }

//   per_page = parseInt(req.query.per_page) || 3;
//   page_no = parseInt(req.query.page_no) || 1;
//   const page = +req.query.page || 1;
//   let totalItems;
//   let hasPreviousPage, hasNextPage;
//   let queryString = {
//     location: {
//       $in: searchFilter,
//     },
//   };
//   var query = [{ path: "createdBy" }, { path: "slots" }];
//   const docdetail = await doc.find().populate(query);
//   const slots = await slot.find();

//   doc.find({ location: searchFilter }, (err, docs) => {
//     if (!err) {
//       res.render("doctors", {
//         slots: slots,
//         searchFilter: searchFilter,
//         docdetail: docdetail,
//         list: docs,
//         moment: moment,
//         currentPage: page,
//         hasNextPage: per_page * page < totalItems,
//         hasPreviousPage: page > 1,
//         nextPage: page + 1,
//         previousPage: page - 1,
//         lastPage: Math.ceil(totalItems / per_page),
//         days: days,
//       });
//     } else {
//       console.log("error");
//     }
//   });
// });

router.get("/doctors/hospital", ensureAuthenticated, async (req, res) => {
  const { searchFilter, searchTreatment, searchHospital } = req.query;
  let days = [];
  let daysRequired = 7;
  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
  }

  per_page = parseInt(req.query.per_page) || 3;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;
  let queryString = {
    hospitalList: {
      $in: searchHospital,
    },
  };
  var query = [{ path: "createdBy" }, { path: "slots" }];
  const docdetail = await doc.find().populate(query);
  const slots = await slot.find();

  doc.find(queryString, (err, docs) => {
    if (!err) {
      res.render("doctors", {
        slots: slots,
        searchFilter: searchFilter,
        docdetail: docdetail,
        list: docs,
        moment: moment,
        currentPage: page,
        hasNextPage: per_page * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / per_page),
        days: days,
      });
    } else {
      console.log("error");
    }
  });
});

router.get("/doctors/search", ensureAuthenticated, async (req, res) => {
  const { searchLocation } = req.query;
  let days = [];
  let daysRequired = 7;
  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
  }

  per_page = parseInt(req.query.per_page) || 3;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;

  var query = [{ path: "createdBy" }, { path: "slots" }];
  const slots = await slot.find();

  doc
    .find({ location: { $regex: req.query.searchLocation, $options: "i" } })
    .populate(query)
    .exec((err, docs) => {
      if (!err) {
        res.render("doctors", {
          slots: slots,
          list: docs,
          moment: moment,
          currentPage: page,
          hasNextPage: per_page * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / per_page),
          days: days,
        });
      } else {
        console.log("error");
      }
    });
});

router.get("/doctors/treatment", ensureAuthenticated, async (req, res) => {
  const { searchFilter, searchTreatment } = req.query;
  let days = [];
  let daysRequired = 7;
  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
  }

  per_page = parseInt(req.query.per_page) || 3;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;

  var query = [{ path: "createdBy" }, { path: "slots" }];
  const slots = await slot.find();

  doc
    .find({ treatment: { $regex: req.query.searchTreatment, $options: "i" } })
    .populate(query)
    .exec((err, docs) => {
      if (!err) {
        res.render("doctors", {
          slots: slots,
          searchFilter: searchFilter,
          list: docs,
          moment: moment,
          currentPage: page,
          hasNextPage: per_page * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / per_page),
          days: days,
        });
      } else {
        console.log("error");
      }
    });
});

// index search result page

router.post("/doctors", ensureAuthenticated, async (req, res) => {
  const { searchPlace, searchQuery } = req.body;
  var regex = new RegExp(searchQuery, "i");

  per_page = parseInt(req.query.per_page) || 3;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;
  var query = [{ path: "createdBy" }, { path: "slots" }];
  const slots = await slot.find();

  doc
    .find({
      $and: [
        {
          $or: [{ hospitalList: regex }, { treatment: regex }],
        },
        { $or: [{ location: searchPlace }] },
      ],
    })
    .populate(query)
    .exec((err, docs) => {
      if (!err) {
        res.render("doctors", {
          slots: slots,
          list: docs,
          moment: moment,
          currentPage: page,
          hasNextPage: per_page * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / per_page),
        });
      } else {
        console.log("error");
      }
    });
});

router.get("/doctors", ensureAuthenticated, (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);
  let days = [];
  let daysRequired = 7;
  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
  }
  var query = [{ path: "createdBy" }, { path: "slots" }];
  var query1 = [{ path: "createdBy" }, { path: "docdetail" }];

  per_page = parseInt(req.query.per_page) || 3;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;

  doc
    .find()
    .countDocuments()
    .then((totalslots) => {
      totalItems = totalslots;
      return doc
        .find({})
        .skip((page - 1) * per_page)
        .limit(per_page)
        .populate(query)
        .exec((err, docs) => {
          // docs.forEach((el) => {
          //   req.session.location = el.location;
          //   console.log(el.location);
          // });
          if (!err) {
            slot
              .find()
              .populate(query1)
              .exec((err, slotsData) => {
                if (!err) {
                  res.render("doctors", {
                    list: docs,
                    moment: moment,
                    currentPage: page,
                    hasNextPage: per_page * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / per_page),
                    slots: slotsData,
                    days: days,
                  });
                }
              });
          }
        });
    });
});

// router.get("/doctors/:id", (req, res) => {
//   let days = [];
//   let daysRequired = 7;
//   for (let i = 0; i <= daysRequired; i++) {
//     days.push(moment().add(i, "days").format("dddd,Do MMMM YYYY"));
//   }
//   per_page = parseInt(req.query.per_page) || 3;
//   page_no = parseInt(req.query.page_no) || 1;
//   const page = +req.query.page || 1;
//   let totalItems;
//   let hasPreviousPage, hasNextPage;
//   var query = [{ path: "createdBy" }, { path: "slots" }];
//   var query1 = [{ path: "createdBy" }, { path: "docdetail" }];

//   USer.findById(req.params.id, (err, doclist) => {
//     if (!err) {
//       doc
//         .find()
//         .populate(query)
//         .exec((err, docs) => {
//           // docs.forEach((el) => console.log(el));
//           if (!err) {
//             slot
//               .find({ createdBy: req.params.id })
//               .populate(query1)
//               .sort("date")
//               .then((slots) => {
//                 res.render("doctors", {
//                   list: docs,
//                   slots: slots,
//                   doc: doc,
//                   moment: moment,
//                   days: days,
//                   currentPage: page,
//                   hasNextPage: per_page * page < totalItems,
//                   hasPreviousPage: page > 1,
//                   nextPage: page + 1,
//                   previousPage: page - 1,
//                   lastPage: Math.ceil(totalItems / per_page),
//                 });
//               });
//           }
//         });
//     }
//   });
// });

router.get("/hospitals", ensureAuthenticated, async (req, res) => {
  res.render("hospitals");
});
router.get("/contactUs", ensureAuthenticated, (req, res) => {
  res.render("contactUs");
});

router.get("/treatment", ensureAuthenticated, async (req, res) => {
  res.render("treatment");
});

router.get("/bookSlot/:id", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  let days = [];
  let daysRequired = 15;
  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("Do MMMM YYYY"));
  }
  var query = [{ path: "createdBy" }, { path: "slots" }];
  var query1 = [{ path: "createdBy" }, { path: "docdetail" }];

  const docs = await doc.find({ createdBy: id });
  USer.findById(req.params.id, (err, doc) => {
    if (!err) {
      slot
        .find({ createdBy: id })
        .populate(query1)
        .sort("date")
        .then((slots) => {
          res.render("bookSlot", {
            slots: slots,
            doc: doc,
            moment: moment,
            days: days,
            docs: docs,
          });
        });
    }
  });
});
router.post("/appointment", ensureAuthenticated, (req, res) => {
  res.render("appointment");
});

router.get("/aboutus", ensureAuthenticated, (req, res) => {
  res.render("aboutus");
});

router.get("/docprofile", ensureAuthenticated, (req, res) => {
  res.render("docprofile");
});

router.get("/abouthospital", ensureAuthenticated, (req, res) => {
  res.render("abouthospital");
});
router.get("/faq", ensureAuthenticated, (req, res) => {
  res.render("faq");
});
router.get("/query", ensureAuthenticated, (req, res) => {
  res.render("query");
});
router.post("/query", ensureAuthenticated, (req, res) => {
  res.render("query");
});

router.get("/tvstra-plus", ensureAuthenticated, (req, res) => {
  res.render("tvstra-plus");
});

router.get("/createSchedule", ensureAuthenticated, (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);

  doc.findOne({ createdBy: createdBy }).then((user) => {
    if (user) {
      const user_id = user.id;
      res.render("createSchedule", { user_id: user_id });
    }
  });
});
router.post("/createSchedule", (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);

  doc.findOne({ createdBy: createdBy }).then((user) => {
    if (user) {
      const {
        dayselect,
        selecthospital,
        startTime,
        endtime,
        interval,
        date,
      } = req.body;
      const docdetail = user._id;
      console.log(docdetail);
      let errors = [];

      if (!selecthospital || !startTime || !endtime || !interval || !date) {
        errors.push({ msg: "fill all details" });
      }
      if (errors.length > 0) {
        res.render("createSchedule", {
          errors,
          dayselect,
          selecthospital,
          startTime,
          endtime,
          interval,
          date,
        });
      } else {
        const newSlot = new slot({
          createdBy,
          docdetail,
          selecthospital,
          startTime,
          endtime,
          interval,
          date,
        });

        newSlot.save().then((slotsdetail) => {
          if (slotsdetail) {
            doc.findByIdAndUpdate(
              docdetail,
              { $push: { slots: slotsdetail._id } },
              { new: true },
              (err, slotdetail1) => {
                if (!err) {
                  req.flash("success_msg", "slot generated successfully");
                  res.redirect("/displaySlot");
                }
              }
            );
          } else {
            req.flash("error_msg", "failed to create schedule");
            res.render("createSchedule", {
              newSlot: req.body,
            });
          }
        });
      }
    }
  });
});

router.get("/displaySlot", ensureAuthenticated, (req, res) => {
  const createdBy = ObjectId(req.session.passport.user._id);
  per_page = parseInt(req.query.per_page) || 7;
  page_no = parseInt(req.query.page_no) || 1;
  const page = +req.query.page || 1;
  let totalItems;
  let hasPreviousPage, hasNextPage;
  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  slot
    .find()
    .countDocuments()
    .then((totalslots) => {
      totalItems = totalslots;
      return slot
        .find({ createdBy: createdBy })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort("-date")
        .then((slots) => {
          if (slots) {
            res.render("displaySlot", {
              dayselect: slots.dayselect,
              selecthospital: slots.selecthospital,
              startTime: slots.startTime,
              endtime: slots.endtime,
              interval: slots.interval,
              slots: slots,
              date: slots.date,
              moment: moment,
              currentPage: page,
              days,
              hasNextPage: per_page * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / per_page),
            });
            // slot
            //   .find({ createdBy: createdBy })
            //   .limit(pagination.limit)
            //   .skip(pagination.skip)
            //   .then((slots) => {
            //     if (slots) {
            //       res.render("displaySlot", {
            //         dayselect: slots.dayselect,
            //         selecthospital: slots.selecthospital,
            //         startTime: slots.startTime,
            //         endtime: slots.endtime,
            //         interval: slots.interval,
            //         slots: slots,
            //         date: slots.date,
            //         moment: moment,
            //       });
          }
        });
    });
});

router.get("/editSlot/:id", (req, res) => {
  slot.findById(req.params.id, (err, doc) => {
    if (!err) {
      res.render("editSlot", { slot: doc, viewTitle: "Update slot" });
    } else {
      req.flash("error_msg", "details not found");
    }
  });
});

router.post("/editSlot/:id", (req, res) => {
  slot.findOneAndUpdate(
    { _id: req.body._id },
    req.body,
    { new: true },
    (err, doc) => {
      if (!err) {
        res.redirect("/displaySlot");
      } else {
        res.render("editSlot");
      }
    }
  );
});

router.get("/deleteSlot/:id", (req, res) => {
  slot.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.redirect("/displaySlot");
    } else {
      req.flash("error_msg", "Failed to delete");
    }
  });
});
module.exports = router;
