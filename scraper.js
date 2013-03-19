var shop = "pwnybeads"; // Shop name (in URL)
var dbEndpoint = "localhost"; // DB endpoint
var jsdom = require("jsdom"); // Moar magick

// Setup DB
var mongoose = require("mongoose"); // Less magick
mongoose.connect("mongodb://" + dbEndpoint + "/" + shop); // Try to connect
var db = mongoose.connection; // Grab a ref
db.on("err", console.error.bind(console, "Connection error:")); // Handle errors

// On connection
db.once("open", function() {
    var numPages; // Number of item pages

    // Setup schema
    var itemSchema = mongoose.Schema({
        _id: String,
        title: String,
        href: String,
        thumb: String
    }); //itemSchema
    // Make a model
    var Item = mongoose.model("Item", itemSchema);

    // Get individual item
    var getItem = (function(url) {
        
    }); // getItem

    // Get a page
    var getPage = (function(page) {
        jsdom.env(
            "http://etsy.com/shop/" + shop + "?page=" + page,
            ["http://code.jquery.com/jquery.js"],
            function (errors, window) {
                var $ = window.$; // Store jQuery reference
                $("#listing-wrapper ul li").each(function() { // For each
                    var item = {}; // Template
                    var $thumb = $(this).find(".listing-thumb"); // Handy
                    var id = $(this).attr("id").split("lid")[1]; // Snag item ID from id attr
                    item.title = $thumb.attr("title").split(":")[0]; // Remove subtitle if any
                    item.href = "http://etsy.com" + $thumb.attr("href").split("?")[0]; // Remove trailing ? if any
                    item.thumb = $thumb.find("img").attr("src"); // Grab thumbnail
                    Item.update( // Update 
                        {_id: id}, // By ID
                        item, // Using this
                        {upsert: true}, // Create if not found
                        function (err) {if(err) console.log("Update error: ", err);}); // Handle errors
                });
                numPages = numPages || $(".pager li a").last().attr("data-page"); // Snag if we don't have
                if(page <= numPages) {
                    getPage(page + 1); // Get next page
                } else {
                    mongoose.disconnect(); // Shutdown DB
                }
            } // function (errors, window)
        ); // jsdom.env
    }); // getPage
     
    getPage(1); // Get first page
}); // db.once

