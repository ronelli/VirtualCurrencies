/// <reference path="jquery-3.5.1.js" />
"use strict";

const state = {
    coins: [],
    checked: []
};
let chart, liveReportTimer;
const MAX_CHECKED_COINS = 5;


(()=> {
    $(document).ready(async function () {
        try {
            const allCoins = await getCoinsListFromAjax();
            displayAllCoins(allCoins);
            // updateSavedDataExpiry();
        }
        catch (err) {
            alert("Error: " + err);
        }
    });
    function displayAllCoins(coinsList) {
        for(let i = 1; i <= 100; i++) {
            const singleCoin = `<div class="card col-12 col-sm-5 col-md-3 col-lg-2 " value="${coinsList[i].symbol}">
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
    //import all coins list from API(using Ajax).
    function getCoinsListFromAjax() {
        return $.ajax({
            url: ("https://api.coingecko.com/api/v3/coins/list"),
        });
    }

    //get more info about specific coin.
    $('#coinsContent').on("click",".btn-info", function() {
        try {
            getCoinData(this);
        }
        catch (err) {
            alert(err);
        }
    });
    
    function getCoinData(obj) {
        $(obj).next().on('shown.bs.collapse',async function () {
            const idBox = $(obj).attr('id');
            if(dataExistInMemory(idBox)){
                const coinMemoryDetails = getDetailsFromMemory(idBox);
                displayMoreInfoCoinDetails(coinMemoryDetails,obj);
            }
            else {
                const coinAjaxDetails = await getCoinDetails(idBox);
                displayProgressBar(obj);
                saveInMemory(coinAjaxDetails);
                displayMoreInfoCoinDetails(coinAjaxDetails,obj);
            }     
        });
    }

    function dataExistInMemory(idBox) {
        return (sessionStorage.getItem(idBox) === null) ? false: true;
    }
    
    function getDetailsFromMemory(idBox) {
        const obj = sessionStorage.getItem(idBox);
        return JSON.parse(obj);
    }

    function saveInMemory(coinAjaxDetails) {
        const json = JSON.stringify(coinAjaxDetails);
        sessionStorage.setItem(coinAjaxDetails.id,json);
        setTimeout(() => {
            sessionStorage.removeItem(coinAjaxDetails.id);
        },1000 * 120)
    }

    //waiting icon - progress bar while waiting for getting coin details.
    function displayProgressBar(obj) {
        $(obj).next().html(
            `<div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>`);
    }

    function getCoinDetails(idBox) {
        return  $.ajax({
            url:(`https://api.coingecko.com/api/v3/coins/${idBox}`)
        });
    };

    function displayMoreInfoCoinDetails(coinDetails, currentObj) {
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
                $(currentObj).next().html(infoAboutCoin);
            }, 1500);
    }
    

    $('#coinsContent').on("mouseover",".form-check-input", function() {
        // $(this).attr({});
    });

    $('#coinsContent').on("click",".form-check-input", function() {
        const symbol = $(this).val();
        toggleCoin(symbol);
        // if ($(this).is(':checked',false)) { //check debug
        //     console.log(state.checked);
        // }

    });

    function toggleCoin(symbol) {
        if (state.checked.includes(symbol)) {
            removeCoinFromReportList(symbol);
        } 
        else {
            if (state.checked.length < MAX_CHECKED_COINS) {
                state.checked.push(symbol);
            } 
            else {
                displayModel(symbol);
            }
        }
    }

    function displayModel(symbol) {
        $("#modelBox").html(
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
        $('.modal').fadeIn(500).modal('show');
    }

    $("#modelBox").on("click",".cancelAction",function() {
        turnOffToggleButton($(this).val());
    })

    $("#modelBox").on("click",".btn-primary", function() {
        const newCoin = $(this).val();
        const selectedCoinTag = $(this).parent().parent().find(".active")[0];
        const coinToRemove = $(selectedCoinTag).attr("value");
        removeCoinFromReportList(coinToRemove);
        turnOffToggleButton(coinToRemove);
        state.checked.push(newCoin);
    })
    
    function turnOffToggleButton(coinSymbol) {
        $(`#switch${coinSymbol}`).prop("checked",false);
    }

    function removeCoinFromReportList(symbol) {
        const indexInArray = state.checked.findIndex(index => index === symbol);
        state.checked.splice(indexInArray, 1);
    }
    
    // function arrangeRelevantCoins() {
        
    // }
    $(".searchBox").keyup(function (){
        const value = $(this).val();
        $("#coinsContent").toggle(value === "");
        const allCoins = [];
        $(state.coins).each(index => {
            allCoins.push(state.coins[index]);
        })
        const searchedCoins = allCoins.filter(coinFormat => {
            const coinSymbol = $(coinFormat).find(".card-title").text();
            for(let i = 0; i < value.length; i++) {
                if(coinSymbol[i] !== value[i]) {
                    return false;
                }
            }
            return true;
        });
        displaySearchedCoins(searchedCoins);     
    });

    function displaySearchedCoins(searchedCoins) {
        $("#coinsContent").empty();
        for(const coin of searchedCoins) {
            $("#coinsContent").append(coin);
        }
        updateCoinReportStatus(searchedCoins);
        $("#coinsContent").show();
    }

    function updateCoinReportStatus(searchedCoins) {
        $(state.checked).each(index => $(`#coinsContent :input[value="${state.checked[index]}"]`).prop("checked",true));
    }

    // $(".searchBox").click(function() {
    //     alert("a");
    // })
    // $(".searchBox").on("search", function(event) {
    //     if(event.keyCode === 13){
    //         event.preventDefault();
    //     }
    //     else {
    //         $("#coinsContent").show();
    //     }
    // });

    $("#nav-profile-tab").on("click",async () => {
        try {
            const coinsDollarCost = await getDollarValueAsync();
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

    function getCurrentTime() {
        const today = new Date();
        return new Date(today.getFullYear(),today.getMonth() + 1,today.getDay(),today.getHours(),today.getMinutes(),today.getSeconds())
    }
    
    function updateDollarValues(chart) {
        liveReportTimer = setInterval(async () => {
            const coinsDollarCost = await getDollarValueAsync();
            $(chart.data).each(index => {
                chart.data[index].dataPoints.push( { x: getCurrentTime(),  y: coinsDollarCost[state.checked[index].toUpperCase()].USD })
            })
            chart.render();
        }, 2000);
    };
    
    function getDollarValueAsync() {
        return $.ajax({
            url: (`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${state.checked[0]},${state.checked[1]},${state.checked[2]},${state.checked[3]},${state.checked[4]},&tsyms=USD`),
        });
    }

    $(".generalInfo").on("click", () => {
        if(chart !== undefined){
            clearInterval(liveReportTimer);
	        chart.destroy();
            chart = undefined;
        };
        $("#alertNoneReportCoins").hide()  
    });

})();
