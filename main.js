/// <reference path="jquery-3.5.1.js" />
"use strict";

//global variables: 
//Magic number
const MAX_CHECKED_COINS = 5;
//object that includes array of all coins, and array of 'checked' coins 
const state = {
    coins: [],
    checked: []
};

//chart - for creating chart(chart), liveReportTimer - for getting id of interval.
let chart, liveReportTimer;

$(()=> {
    $(document).ready(async function () {
        try {
            const allCoins = await getCoinsListFromAjaxAsync();
            displayAllCoins(allCoins);
        }
        catch (err) {
            alert("Error: " + err);
        }
    });

    //Display all coins onscreen.
    function displayAllCoins(coinsList) {
        for(let i = 1; i <= 100; i++) {
            const singleCoin = `<div class="card col-12 col-md-5 col-lg-3" value="${coinsList[i].symbol}">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="switch${coinsList[i].symbol}" value="${coinsList[i].symbol}" data-bs-container="body" data-bs-toggle="popover" title="Add / Remove coin in 'Live Report'">
                                    </div>
                                    <div class="card-body">
                                        <h5 class="card-title">${coinsList[i].symbol}</h5>
                                        <p class="card-text">${coinsList[i].name}</p>
                                        <button class="btn btn-info" id="${coinsList[i].id}" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample${i}" aria-expanded="false" aria-controls="collapseExample">More Info</button>
                                        <div class="collapse" id="collapseExample${i}">
                                        </div>
                                    </div>
                                </div>`;
            state.coins.push(singleCoin);
            $("#coinsContent").append(singleCoin);
        }
    }
    
    //import all coins list from API(using ajax).
    function getCoinsListFromAjaxAsync() {
        return $.ajax({
            url: ("https://api.coingecko.com/api/v3/coins/list"),
        });
    }

    //event for each click on 'More info' button 
    $('#coinsContent').on("click",".btn-info", function() {
        try {
            getCoinData(this);
        }
        catch (err) {
            alert(err);
        }
    });
    
    //Get coin data of clicked coin.
    function getCoinData(coinObject) {
        $(coinObject).next().on('shown.bs.collapse',async function () {
            const coinSymbol = $(coinObject).attr('id');
            if(dataExistInMemory(coinSymbol)){
                const coinMemoryDetails = getDetailsFromMemory(coinSymbol);
                displayMoreInfoCoinDetails(coinMemoryDetails,coinObject);
            }
            else {
                const coinAjaxDetails = await getCoinDetails(coinSymbol);
                displayProgressBar(coinObject);
                saveCoinObjInMemory(coinAjaxDetails);
                displayMoreInfoCoinDetails(coinAjaxDetails,coinObject);
            }     
        });
    }

    //check if coin is saved in session storage.
    function dataExistInMemory(coinSymbol) {
        return (sessionStorage.getItem(coinSymbol) === null) ? false: true;
    }

    //Get coin details from session storage.
    function getDetailsFromMemory(coinSymbol) {
        const coinObject = sessionStorage.getItem(coinSymbol);
        return $.parseJSON(coinObject);
    }

    //Save coin object details in session storage
    function saveCoinObjInMemory(coinAjaxDetails) {
        const coinObject = JSON.stringify(coinAjaxDetails);
        sessionStorage.setItem(coinAjaxDetails.id,coinObject);
        setTimeout(() => {
            sessionStorage.removeItem(coinAjaxDetails.id);
        },1000 * 120)
    }

    //waiting icon - progress bar while waiting for getting coin details.
    function displayProgressBar(coinObject) {
        $(coinObject).next().html(
            `<div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`);
    }

    //import specific coin from API(using Ajax). 
    function getCoinDetails(coinSymbol) {
        return  $.ajax({
            url:(`https://api.coingecko.com/api/v3/coins/${coinSymbol}`)
        });
    };

    //display 'More Info' data of specific coin.
    function displayMoreInfoCoinDetails(coinDetails, currentCoinObject) {
            const infoAboutCoin = 
            `<table>
                <thead>
                    <tr><th>Currency value:</th></tr>
                </thead>
                <tbody>
                    <tr><td>${coinDetails.market_data.current_price.usd.toFixed(2)}&#36; </td></tr>
                    <tr><td>${coinDetails.market_data.current_price.eur.toFixed(2)}&euro;</td></tr>
                    <tr><td>${coinDetails.market_data.current_price.ils.toFixed(2)}&#8362;</td></tr>
                    <tr><td><img src="${coinDetails.image.small}"></td></tr>
                </tbody>
            </table>`;
            setTimeout(() => {
                $(currentCoinObject).next().html(infoAboutCoin);
            }, 1500);
    }
    
    //On click event - when 'toggle button' button is clicked.
    $('#coinsContent').on("click",".form-check-input", function() {
        const symbol = $(this).val();
        toggleCoin(symbol);
    });

    // Toggle selected coin.
    function toggleCoin(symbol) {
        if (state.checked.includes(symbol)) {
            removeCoinFromToggleArr(symbol);
        } 
        else {
            if (state.checked.length < MAX_CHECKED_COINS) {
                state.checked.push(symbol);
            } 
            else {
                displayModal(symbol);
            }
        }
    }

    //display modal onscreen
    function displayModal(symbol) {
        $("#modalBox").html(
            `<div class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Select a currency to remove </h5>
                            <button type="button" class="btn-close cancelAction" data-bs-dismiss="modal" aria-label="Close" value="${symbol}"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-12">
                                    <div class="list-group" id="list-tab" role="tablist">
                                        <a class="list-group-item list-group-item-action active" data-bs-toggle="list" role="tab" value="${state.checked[0]}">${state.checked[0]}</a>
                                        <a class="list-group-item list-group-item-action" data-bs-toggle="list" role="tab" value="${state.checked[1]}">${state.checked[1]}</a>
                                        <a class="list-group-item list-group-item-action" data-bs-toggle="list" role="tab" value="${state.checked[2]}">${state.checked[2]}</a>
                                        <a class="list-group-item list-group-item-action" data-bs-toggle="list" role="tab" value="${state.checked[3]}">${state.checked[3]}</a>
                                        <a class="list-group-item list-group-item-action" data-bs-toggle="list" role="tab" value="${state.checked[4]}">${state.checked[4]}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary cancelAction" data-bs-dismiss="modal" value="${symbol}">Cancel</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" value="${symbol}">Save changes</button>
                        </div>
                     </div>
                </div>
            </div>`);
            $('.modal').modal({backdrop: 'static', keyboard: false});
            $('.modal').fadeIn(500).modal('show');
    }

    //On click event - on cancel action when modal display.
    $("#modalBox").on("click",".cancelAction",function() {
        turnOffToggleButton($(this).val());
    })

    //On click event - on submit action when modal display.
    $("#modalBox").on("click",".btn-primary", function() {
        const newCoin = $(this).val();
        const selectedCoinTag = $(this).parent().parent().find(".active")[0];
        const coinToRemove = $(selectedCoinTag).attr("value");
        removeCoinFromToggleArr(coinToRemove);
        turnOffToggleButton(coinToRemove);
        state.checked.push(newCoin);
    })
    
    //internal function - turn off toggle button.
    function turnOffToggleButton(coinSymbol) {
        $(`#switch${coinSymbol}`).prop("checked",false);
    }

    //internal function - remove toggle button from checked coins array.
    function removeCoinFromToggleArr(symbol) {
        const indexInArray = state.checked.findIndex(index => index === symbol);
        state.checked.splice(indexInArray, 1);
    }
    
    //On key up event -  when writing inside input search button.
    $(".searchBox").keyup(function (){
        const inputValue = $(this).val().toUpperCase();
        $("#coinsContent").toggle(inputValue === "");
        const searchedCoins = state.coins.filter(coinFormat => {
            const coinSymbol = $(coinFormat).find(".card-title").text().toUpperCase();
            return isInputIncludesCoinSymbol(inputValue, coinSymbol);
        });
        displaySearchedCoins(searchedCoins);     
    });
    
    //Checks if input is equal to coin symbol.
    function isInputIncludesCoinSymbol(inputValue, coinSymbol) {
        for(let i = 0; i < inputValue.length; i++) {
            if(coinSymbol[i] !== inputValue[i]) {
                return false;
            }
        }
        return true;
    }
    //Display searched coins.
    function displaySearchedCoins(searchedCoins) {
        $("#coinsContent").empty();
        for(const coin of searchedCoins) {
            $("#coinsContent").append(coin);
        }
        updateCoinCheckedStatus(searchedCoins);
        $("#coinsContent").show();
    }

    //Update toggle status of each coin that inside checked coins array.
    function updateCoinCheckedStatus(searchedCoins) {
        $(state.checked).each(index => $(`#coinsContent :input[value="${state.checked[index]}"]`).prop("checked",true));
    }

    //On click event - when trying to get 'Live Reports'.
    $("#nav-profile-tab").on("click",async () => {
        try {
            const coinsDollarCost = await getCheckedCoinsDollarValueAsync();
            if(coinsDollarCost.Response === "Error"){
                throw "You have to select at least one coin!";
            }
            const chart = drawChart(coinsDollarCost);
            chart.render();
            updateDollarValues(chart);
        }
        catch(err){
            $("#alertNoneReportCoins").html(err).show('fade');  
        }
    })

    //Building format of a chart - include it's features.
    function drawChart(coinsDollarCost) {
        chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        type: 'scatter',
        title: { text: "Currencies Dollar Value", fontFamily: "tehoma",backgroundColor: "#ffeed2" },
        axisX: { 
            title: "Time",
            titleFontColor: "#8839d1",
            lineColor: "#8839d1",
            labelFontColor: "#8839d1",
            tickColor: "#8839d1"
        },
        axisY: {
            title: "Currencies Value (Dollars)",
            titleFontColor: "#4F81BC",
            labelFontColor: "#4F81BC",
        },
        toolTip: { shared: true },
        legend: { cursor: "pointer" },
        data: createPointsOfSelectedCoins(coinsDollarCost)
        });
        return chart;
    }

    //Creating single coin data - part of the chart data 
    function createPointsOfSelectedCoins(coinsDollarCost) {
        const pointsArray = [];
        $(state.checked).each(index => {
            pointsArray.push({
                type: "spline",
                name: state.checked[index],
                showInLegend: true,
                dataPoints: [ { x: getCurrentTime(),  y: coinsDollarCost[state.checked[index].toUpperCase()].USD }]
            })
        });
        return pointsArray;
    }

    //Getting current time.
    function getCurrentTime() {
        const today = new Date();
        return new Date(today.getFullYear(),today.getMonth(),today.getDay(),today.getHours(),today.getMinutes(),today.getSeconds())
    }
    
    //Update values inside the the chart - set interval.
    function updateDollarValues(chart) {
        liveReportTimer = setInterval(async () => {
            const coinsDollarCost = await getCheckedCoinsDollarValueAsync();
            $(chart.data).each(index => {
                chart.data[index].dataPoints.push( { x: getCurrentTime(),  y: coinsDollarCost[state.checked[index].toUpperCase()].USD })
            })
            chart.render();
        }, 2000);
    };
    
    //Getting coins dollar value from API - ajax
    function getCheckedCoinsDollarValueAsync() {
        return $.ajax({
            url: (`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${state.checked[0]},${state.checked[1]},${state.checked[2]},${state.checked[3]},${state.checked[4]},&tsyms=USD`),
        });
    }

    //On click event - when user decide to go to home/about page - clears existing chart!
    $(".generalInfo").on("click", () => {
        if(chart !== undefined){
            clearInterval(liveReportTimer);
	        chart.destroy();
            chart = undefined;
        };
        $("#alertNoneReportCoins").hide()  
    });
});
