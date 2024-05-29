const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cron = require('node-cron');
const os = require('os')

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = `${os.homedir()}\\AppData\\Local\\Google\\Chrome\\User Data`;
let scheduledTask;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function prettyConsole(text) {
    console.log(`[${moment().format('HH:mm:ss')}] ` + text)
}

async function checkIp() {
    try {
        const response = await fetch(`https://freeipapi.com/api/json`);
        const data = await response.json();
        return data.ipAddress;
    } catch (error) {
        prettyConsole(chalk.red('Error fetching IP details:', error));
        return error;
    }
}

async function ovpnReadConfig(folderPath) {
    try {
        const config = fs.readdirSync(folderPath)
            .filter(file => path.extname(file) === '.ovpn')
            .sort((a, b) => {
                // Mengambil angka dari nama file (tanpa ekstensi)
                const numA = parseInt(a.match(/\d+/), 10);
                const numB = parseInt(b.match(/\d+/), 10);

                // Membandingkan angka untuk menyortir secara numerik
                return numA - numB;
            });

        return config;
    } catch (error) {
        prettyConsole(chalk.red('Error :', error));
    }
}

const changeCronSchedule = (minute) => {
    const currentMinute = moment().format('mm')
    let schedule

    if (currentMinute > minute) {
        schedule = minute
    } else {
        schedule = Math.abs(minute - currentMinute)
    }

    if (schedule === currentMinute) {
        schedule = parseInt(currentMinute / 2)
    }

    console.log(chalk.cyan(`\n<=============================[Rest until minute ${schedule} in o'clock]=============================>`))

    // Hapus jadwal cron yang sudah ada jika ada
    if (scheduledTask) {
        scheduledTask.stop();
    }

    // Buat jadwal cron baru
    scheduledTask = cron.schedule(`${schedule} * * * *`, () => {
        main();
    });
};

async function rest() {
    const rest = (Math.random() * (30 - 15) + 15) * 1000
    prettyConsole(chalk.green(`Take rest for ${Math.floor(rest / 1000)} second\n`))
    await sleep(rest)
}

async function killApps() {
    exec('taskkill /F /IM chrome.exe');
    exec('taskkill /F /IM openvpn-gui.exe');
    exec('taskkill /F /IM openvpn.exe');
}

async function checkCommand(element, profile, message) {
    let checkCommand = false
    let trycheckCommand = 0

    while (checkCommand === false) {
        if (trycheckCommand <= 3) {
            try {
                await element(profile)
                checkCommand = true
                return checkCommand
            } catch (error) {
                prettyConsole(chalk.yellow(`Still Fetch ${message}`))
                trycheckCommand++
            }
        } else {
            prettyConsole(chalk.red(`Profile ${profile} ${message} Show So Take Long Time`))
            checkCommand = true
            return false
        }
    }
}


const upgradeSpeed = async (iframe, balance, x) => {
    let level
    let price
    let isContinue
    // Check Price Upgrade Speed
    const priceUpgrade = async (x) => {
        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkCommand(priceUpgrade, x, 'Check Price Upgrade Speed')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Speed :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Speed
    const levelSpeed = async (x) => {
        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    isContinue = await checkCommand(levelSpeed, x, 'Check Level Speed')

    if (!isContinue) {
        return false
    }

    if (balance >= (price * 2)) {

        // Click For Upgrade
        const upgradeClick = async (x) => {
            await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1)');
            await iframe.evaluate(() => {
                document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1)').click();
            })
        }

        isContinue = await checkCommand(upgradeClick, x, 'Click For Upgrade')

        if (!isContinue) {
            return false
        }

        await sleep(3000)

        // Confirm Upgrade
        const confirmUpgrade = async (x) => {
            await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
            await sleep(3000)
            await iframe.evaluate(() => {
                document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
            })
        }

        isContinue = await checkCommand(confirmUpgrade, x, 'Confirm Upgrade')

        if (!isContinue) {
            return false
        }

        // Make Sure Upgraded
        const makeSureUpgrade = async (x) => {
            await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
        }

        const upgraded = await checkCommand(makeSureUpgrade, x, 'Make Sure Upgrade')

        if (upgraded) {
            // Click Got it
            const gotIt = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                await sleep(3000)
                await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                })
            }

            isContinue = await checkCommand(gotIt, x, 'Click Got it')

            if (!isContinue) {
                return false
            }

            await sleep(3000)

            // Check Level Speed
            isContinue = await checkCommand(levelSpeed, x, 'Check Level Speed')

            if (!isContinue) {
                return false
            }

            prettyConsole(chalk.green(`Upgrade Level Speed Successfully, Current Level Speed :${level}`))

            balance = balance - price
        } else {
            prettyConsole(chalk.red(`Upgrade Level Speed Failed!`))
        }
    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Must > Price*2 For Upgrade Speed`))
    }
}

const upgradeStorage = async (iframe, balance, x) => {
    let level
    let price
    let isContinue

    // Check Price Upgrade Storage
    const checkPrice = async (x) => {
        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkCommand(checkPrice, x, 'Check Price Upgrade Storage')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Storage :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Storage
    const checkLevel = async (x) => {
        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    isContinue = await checkCommand(checkLevel, x, 'Check Level Storage')

    if (!isContinue) {
        return false
    }

    if (balance >= (price * 2)) {
        // Click For Upgrade
        const clickUpgrade = async (x) => {
            await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div');
            account = await iframe.evaluate(() => {
                document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div').click();
            })
        }

        isContinue = await checkCommand(clickUpgrade, x, 'Click For Upgrade')

        if (!isContinue) {
            return false
        }

        await sleep(3000)

        // Confirm Upgrade
        const confirmUpgrade = async (x) => {
            await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
            await sleep(3000)
            await iframe.evaluate(() => {
                document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
            })
        }

        isContinue = await checkCommand(confirmUpgrade, x, 'Confirm Upgrade')

        if (!isContinue) {
            return false
        }

        // Make Sure Upgraded
        const makeSureUpgrade = async (x) => {
            await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
            await iframe.evaluate(() => {
                const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                return element.textContent
            })
        }

        const upgraded = await checkCommand(makeSureUpgrade, x, 'Make Sure Upgraded')

        await sleep(3000)

        if (upgraded) {
            // Check Level Storage
            const isContinue = await checkCommand(checkLevel, x, 'Make Sure Upgraded')

            if (!isContinue) {
                return false
            }

            prettyConsole(chalk.green(`Upgrade Level Storage Successfully, Current Level Storage :${level}`))
        } else {
            prettyConsole(chalk.red(`Upgrade Level Storage Failed!`))
        }
    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Must > Price*2 For Upgrade Storage`))
    }
}

const upgradeBoat = async (iframe, balance, x) => {
    let level
    let price
    let isContinue

    // Click Level Up
    const clickLevelUpBoat = async () => {
        await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.block-btn.absolute > button');
        await iframe.evaluate(() => {
            document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.block-btn.absolute > button').click();
        })
    }

    isContinue = await checkCommand(clickLevelUpBoat, x, 'Check Level Up Boat')

    if (!isContinue) {
        return false
    }

    await sleep(3000)


    // Check Price Upgrade Boat
    const checkPrice = async (x) => {
        await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkCommand(checkPrice, x, 'Check Price Upgrade Boat')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Boat :${price} ${chalk.cyan('$OCEAN💎')}`))

    await sleep(3000)


    if (price < 100) {
        if (balance >= (price * 2)) {
            // Click Upgrade
            const clickUpgradeBoat = async () => {
                await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button');
                await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button').click();
                })
            }

            isContinue = await checkCommand(clickUpgradeBoat, x, 'Click Upgrade Boat')

            if (!isContinue) {
                return false
            }

            await sleep(5000)

            // Check New Price Upgrade Boat
            let newPrice
            const checkNewPrice = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
                newPrice = await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
                    return parseFloat(element.textContent)
                })
            }

            isContinue = await checkCommand(checkNewPrice, x, 'Check New Price')

            if (!isContinue) {
                return false
            }

            if (price > newPrice) {
                prettyConsole(chalk.green(`Upgrade Boat Successfully`))
            } else {
                prettyConsole(chalk.red(`Upgrade Boat Failed!!!`))
            }
        } else {
            prettyConsole(chalk.yellow(`Balance Not Enough For Upgrade Boat`))
        }
    } else {
        prettyConsole(chalk.yellow(`Upgrade Boat So Expensive`))
    }

}

const upgradeAquaCat = async (iframe, balance, x) => {
    let level
    let price
    let isContinue

    // Click Level Up
    const clickLevelUpBoat = async () => {
        await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.block-btn.absolute > button');
        await iframe.evaluate(() => {
            document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.block-btn.absolute > button').click();
        })
    }

    isContinue = await checkCommand(clickLevelUpBoat, x, 'Check Level Up Aqua Cat')

    if (!isContinue) {
        return false
    }

    await sleep(3000)

    // Check Price Upgrade Speed
    const checkPrice = async (x) => {
        await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkCommand(checkPrice, x, 'Check Price Upgrade Aqua Cat')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Aqua Cat :${price} ${chalk.cyan('$OCEAN💎')}`))

    await sleep(3000)

    if (price < 200) {
        if (balance >= (price * 2)) {
            // Click Upgrade
            const clickUpgradeAqua = async () => {
                await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button');
                await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button').click();
                })
            }

            isContinue = await checkCommand(clickUpgradeAqua, x, 'Click Upgrade Aqua Cat')

            if (!isContinue) {
                return false
            }

            await sleep(5000)

            // Check New Price Upgrade Boat
            let newPrice
            const checkNewPrice = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
                newPrice = await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(4) > div.bottom-sheet > div > main > div > div > div > div:nth-child(3) > div > button > span');
                    return parseFloat(element.textContent)
                })
            }

            isContinue = await checkCommand(checkNewPrice, x, 'Check New Price')

            if (!isContinue) {
                return false
            }

            if (price > newPrice) {
                prettyConsole(chalk.green(`Upgrade Aqua Cat Successfully`))
            } else {
                prettyConsole(chalk.red(`Upgrade Aqua Cat Failed!!!`))
            }
        } else {
            prettyConsole(chalk.yellow(`Balance Not Enough For Upgrade Aqua Cat`))
        }
    } else {
        prettyConsole(chalk.yellow(`Upgrade Aqua Cat So Expensive`))
    }

}

async function main() {
    console.log(chalk.cyan(`\n<====================[${moment().format('HH:mm:ss DD-MM-YYYY')}]====================>`))
    let totalBalanceHot = 0
    let totalBalanceWave = 0
    let totalBalanceSui = 0

    const minute = Math.floor(Math.random() * (15 - 1 + 1)) + 1
    const ovpnConfig = await ovpnReadConfig(folderPath)

    mainLoop: for (let x = 0; x <= 22; x++) {
        if (x !== 0) {
            console.log(chalk.cyan(`\n<===================================================================================>`))
        }

        await killApps()

        await sleep(5000)

        const ip = await checkIp()
        prettyConsole(chalk.yellow(`Current IP : ${ip}`))

        let isVpn = false;
        let vpn, browser, isContinue, isBrowser

        if (x === 22) {
            isVpn = true
        } else {
            exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

            // Wait for VPN connection to be established
            await new Promise(resolve => setTimeout(resolve, 5000));
            let tryVpn = 0
            while (!isVpn) {
                vpn = await checkIp();
                if (vpn !== ip) {
                    isVpn = true;
                    prettyConsole(chalk.green(`VPN connected successfully!, IP : ${vpn}`));
                }

                await new Promise(resolve => setTimeout(resolve, 5000));

                if (tryVpn === 50) {
                    await killApps();
                    await rest()
                    continue mainLoop
                }

                tryVpn++
            }
        }

        if (isVpn) {
            // Connect Browser
            if (x === 22) {
                const connectBrowser = async () => {
                    let launchOptions = {
                        headless: true,
                        args: [
                            `--user-data-dir=${chromeUserPath}`,
                            '--profile-directory=Profile 23'
                        ]
                    };

                    browser = await puppeteer.launch(launchOptions)

                    const browserConnected = await browser.isConnected()

                    if (browserConnected) {
                        isBrowser = true;
                    } else {
                        prettyConsole(chalk.red(`Try Hard To Launch Browser!, Switch Next Profile`))
                    }
                }

                isContinue = await checkCommand(connectBrowser, x, "connectBrowser")

                if (!isContinue) {
                    await rest();
                    continue mainLoop
                }
            } else {
                const connectBrowser = async () => {
                    let launchOptions = {
                        headless: true,
                        args: [
                            `--user-data-dir=${chromeUserPath}`,
                            x === 0 ? '--profile-directory=Default' : `--profile-directory=Profile ${x}`
                        ]
                    };

                    browser = await puppeteer.launch(launchOptions)

                    const browserConnected = await browser.isConnected()

                    if (browserConnected) {
                        isBrowser = true;
                    } else {
                        prettyConsole(chalk.red(`Try Hard To Launch Browser!, Switch Next Profile`))
                    }
                }

                isContinue = await checkCommand(connectBrowser, x, "connectBrowser")


                if (!isContinue) {
                    await rest();
                    continue mainLoop
                }
            }

            await sleep(3000)

            prettyConsole(chalk.green(`Profile\t:${x}`))

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            const hotWallet = true;

            if (hotWallet) {
                console.log(chalk.cyan(`\n[Bansos ${chalk.yellow('$HOT🔥')}]`))
                // Goto Link
                const gotoLink = async (x) => {
                    await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
                }

                await checkCommand(gotoLink, x, 'Goto Link')

                await sleep(3000)

                // Click Claim Now
                const claimNow = async (x) => {
                    await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                    await sleep(3000)
                    await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                }

                await checkCommand(claimNow, x, 'Click Claim Now')

                await sleep(3000)

                // Click Button Launch
                const buttonLaunch = async (x) => {
                    await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                    await sleep(3000)
                    await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                }

                await checkCommand(buttonLaunch, x, 'Click Button Launch')

                await sleep(3000)

                // Handle iframe
                const iframeSelector = '.payment-verification';
                let iframeElementHandle
                let iframe
                const handleFrame = async (x) => {
                    await page.waitForSelector(iframeSelector)
                    iframeElementHandle = await page.$(iframeSelector);
                }

                await checkCommand(handleFrame, x, 'Handle iframe')

                await sleep(3000)

                try {
                    iframe = await iframeElementHandle.contentFrame();
                } catch (error) {
                    prettyConsole(chalk.red(`Error:\t:${error.message}`))
                    await killApps()
                    await rest()
                    continue mainLoop;
                }


                let account

                // Get Account Name
                const getAccountName = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(1) > p');
                    account = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(1) > p');
                        return element.textContent
                    })
                }

                await checkCommand(getAccountName, x, 'Get Account Name')

                prettyConsole(chalk.green(`Account\t:${account}`))

                // let near

                // // Get Near Balance
                // const nearBalance = async (x) => {
                //     await iframe.waitForSelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(6) > div:nth-child(2) > div:nth-child(1)  > div:nth-child(2) > p:nth-child(2)');
                //     near = await iframe.evaluate(() => {
                //         const element = document.querySelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(6) > div:nth-child(2) > div:nth-child(1)  > div:nth-child(2) > p:nth-child(2)');
                //         return element.textContent
                //     })
                // }

                // await checkCommand(nearBalance, x, 'Get Near Balance')

                // prettyConsole(chalk.green(`Near Balance\t:${near}`))

                let balance

                // Check Balance
                const checkBalance = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div > p');
                    balance = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div > p');
                        return parseFloat(element.textContent)
                    });
                }

                await checkCommand(checkBalance, x, 'Check Balance')

                prettyConsole(chalk.green(`Balance\t:${balance} ${chalk.yellow('$HOT🔥')}`))
                totalBalanceHot = totalBalanceHot + balance

                let storage = 0
                const threshold = 93;

                await sleep(5000)

                // Check Storage
                const checkStorage = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                    storage = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                        const height = window.getComputedStyle(element).getPropertyValue("height").match(/\d+(\.\d+)?/);
                        return Math.floor(parseFloat(height[0]))
                    });
                }

                await checkCommand(checkStorage, x, 'Check Storage')

                prettyConsole(chalk.green(`Storage\t:${storage}%`))

                // Click Storage
                const clickStorage = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div:nth-child(2)').click();
                    });
                }

                await checkCommand(clickStorage, x, 'Click Storage')

                await sleep(3000)

                if (storage >= threshold) {
                    let claimed = false

                    // Claim $HOT🔥
                    do {
                        // Click Claim
                        const clickClaim = async (x) => {
                            const claimSelector = '#root > div > div > div:nth-child(4) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                            await iframe.waitForSelector(claimSelector);
                            await iframe.evaluate((selector) => {
                                document.querySelector(selector).click();
                            }, claimSelector);
                        }

                        await checkCommand(clickClaim, x, 'Click Claim')

                        prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT🔥')}`))

                        let balanceAfter = 0
                        let makeSure = false
                        let tryMakeSure = 0

                        // Check Balance After Claim And Reclaim If Not Claimed
                        do {
                            if (tryMakeSure <= 5) {
                                if (balanceAfter <= balance) {
                                    try {
                                        // Check balance for makesure is claimed
                                        balanceAfter = await iframe.evaluate(() => {
                                            const element = document.querySelector('#root > div > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                                            return parseFloat(element.textContent);
                                        });
                                    } catch (error) {
                                        prettyConsole(chalk.red(error.message))
                                    }

                                    await sleep(5000)

                                    if (tryMakeSure === 5) {
                                        prettyConsole(chalk.yellow(`Still Claiming ${chalk.yellow('$HOT🔥')}`))
                                    }


                                    tryMakeSure++

                                    await sleep(10000)
                                } else {
                                    prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT🔥')} Successfully!`))
                                    prettyConsole(chalk.green(`Update Balance\t:${balanceAfter} ${chalk.yellow('$HOT🔥')}`))
                                    makeSure = true
                                    claimed = true
                                }
                            } else {
                                // Tweak if not claimed with clicking boost
                                prettyConsole(chalk.red(`Failed Claiming ${chalk.yellow('$HOT🔥')} !!!`))
                                makeSure = true
                                claimed = true
                            }
                        } while (makeSure === false)
                    } while (claimed === false)
                } else {
                    prettyConsole(chalk.yellow(`You Can Claim $HOT🔥 If Storage >= ${threshold}% `))
                }

                // // Click Boost
                // const clickBoost = async (x) => {
                //     await iframe.waitForSelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                //     account = await iframe.evaluate(() => {
                //         document.querySelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                //     })
                // }

                // isContinue = await checkCommand(clickBoost, x, 'Click Boost')

                // if (!isContinue) {
                //     await browser.close()
                //     exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                //     const rest = (Math.random() * (30 - 15) + 15) * 1000
                //     prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                //     await sleep(rest)
                //     continue mainLoop
                // }

                // await upgradeSpeed(iframe, balance, x)

                // await upgradeStorage(iframe, balance, x)
            }

            const waveWallet = true;
            if (waveWallet && x !== 21) {
                const wavePage = await browser.newPage()
                console.log(chalk.cyan(`\n[Bansos ${chalk.cyan('$OCEAN💎')}]`))
                // Goto Link
                const gotoLink = async () => {
                    await wavePage.goto('https://web.telegram.org/k/#@waveonsuibot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
                }

                isContinue = await checkCommand(gotoLink, x, 'gotoLink')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                // Click Open Wallet
                const openWallet = async () => {
                    await wavePage.waitForSelector('a.anchor-url[href="https://t.me/waveonsuibot/walletapp"]')
                    await sleep(3000)
                    await wavePage.click('a.anchor-url[href="https://t.me/waveonsuibot/walletapp"]')
                }

                isContinue = await checkCommand(openWallet, x, 'Click Open Wallet')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                // Click Button Launch
                const buttonLaunch = async (x) => {
                    await wavePage.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                    await sleep(3000)
                    await wavePage.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                }

                isContinue = await checkCommand(buttonLaunch, x, 'Click Button Launch')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                // Handle iframe
                const iframeSelector = '.payment-verification';
                let iframeElementHandle
                const handleFrame = async () => {
                    await wavePage.waitForSelector(iframeSelector)
                    iframeElementHandle = await wavePage.$(iframeSelector);
                }

                isContinue = await checkCommand(handleFrame, x, 'Handle iframe')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                const iframe = await iframeElementHandle.contentFrame();

                let balanceSui

                // Check Balance Sui
                const checkSui = async () => {
                    await iframe.waitForSelector('div.portfolio_block > div:nth-child(2) > div > div:nth-child(1) > p.wave_number');
                    balanceSui = await iframe.evaluate(() => {
                        const element = document.querySelector('div.portfolio_block > div:nth-child(2) > div > div:nth-child(1) > p.wave_number');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkSui, x, 'Check Balance Sui')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Balance Sui :${balanceSui} ${chalk.cyan('$SUI')}`))

                totalBalanceSui = totalBalanceSui + balanceSui

                await sleep(3000)

                // Click Claim Now
                const claimNow = async () => {
                    await iframe.waitForSelector('#section-home > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > button');
                    await iframe.evaluate(() => {
                        document.querySelector('#section-home > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > button').click();
                    });
                }

                isContinue = await checkCommand(claimNow, x, 'Click Claim Now')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                let balanceWave

                // Check Balance
                const checkBalance = async (x) => {
                    await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.flex.item-bl-1.flex-row.items-center > div.left.relative > p');
                    balanceWave = await iframe.evaluate(() => {
                        const element = document.querySelector('#section-transaction > div.block-data.h-full > div > div.flex.item-bl-1.flex-row.items-center > div.left.relative > p');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkBalance, x, 'Check Balance')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                prettyConsole(chalk.green(`Balance Ocean :${balanceWave} ${chalk.cyan('$OCEAN💎')}`))
                
                totalBalanceWave = totalBalanceWave + balanceWave

                let speed

                // Check Speed
                const checkSpeed = async (x) => {
                    await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                    speed = await iframe.evaluate(() => {
                        const element = document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkSpeed, x, 'Check Speed')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Speed\t:${speed} $OCEAN💎/Hours`))

                let storage

                // Check Storage
                const checkStorage = async (x) => {
                    await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                    storage = await iframe.evaluate(() => {
                        const element = document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkStorage, x, 'Check Speed')

                if (!isContinue) {
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Max Storage\t:${storage} Hours`))

                let claim = false

                // Check Claim Button
                try {
                    await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > button', { timeout: 5000 });
                    claim = true
                } catch (error) {
                    let claimTime

                    // Check Claim Time
                    const checkClaimTime = async (x) => {
                        await iframe.waitForSelector('#section-transaction > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > span');
                        claimTime = await iframe.evaluate(() => {
                            const element = document.querySelector('#section-transaction > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > span');
                            return element.textContent
                        });
                    }

                    isContinue = await checkCommand(checkClaimTime, x, 'Check Claim Time')

                    if (!isContinue) {
                        await rest()
                        continue mainLoop
                    }

                    prettyConsole(chalk.yellow(`Claim Countdown:${claimTime}`))
                }

                if (claim) {
                    let claimed = false
                    let reclaim = 0

                    do {
                        // Click Claim Button
                        const claimWaveButton = async () => {
                            await iframe.evaluate(() => {
                                document.querySelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > button').click();
                            });
                        }

                        isContinue = await checkCommand(claimWaveButton, x, 'Claim $OCEAN💎')

                        if (!isContinue) {
                            await rest()
                            continue mainLoop
                        }

                        prettyConsole(chalk.green(`Claiming ${chalk.cyan('$OCEAN💎')}......`))

                        let checkClaim

                        // Check Status Claim
                        do {
                            try {
                                await iframe.waitForSelector('#section-transaction > div > div > div:nth-child(3) > div > div > div > div:nth-child(2) > span');
                                claimed = true;
                            } catch (error) {
                                prettyConsole(chalk.yellow(`Still Claiming ${chalk.cyan('$OCEAN💎')}......`))
                                checkClaim++
                            }
                        } while (checkClaim < 3 && !claimed)

                        await sleep(3000)

                        // Tweaking
                        if (!claimed) {
                            prettyConsole(chalk.yellow(`Claiming ${chalk.cyan('$OCEAN💎')} Failed!, Tweaking`))

                            // Click Back
                            const clickBack = async () => {
                                await wavePage.waitForSelector('.popup-close');
                                await wavePage.click('.popup-close');
                            }

                            isContinue = await checkCommand(clickBack, x, 'Click Back')

                            if (!isContinue) {
                                await rest()
                                continue mainLoop
                            }

                            isContinue = await checkCommand(claimNow, x, 'Click Claim Now')

                            if (!isContinue) {
                                await rest()
                                continue mainLoop
                            }

                            reclaim++
                        }
                    } while (!claimed && reclaim < 3)

                    if (claimed) {
                        prettyConsole(chalk.green(`Successfully Claim ${chalk.cyan('$OCEAN💎')}`))
                    } else {
                        prettyConsole(chalk.red("Claiming And Tweaking Failed!"))
                    }
                }

                await sleep(2000)
                await upgradeBoat(iframe, balanceWave, x)
                await sleep(2000)
                await upgradeAquaCat(iframe, balanceWave, x)
            }

            await killApps()
            await rest()
        }
    }

    console.log(chalk.cyan(`\n<===================================================================================>`))
    prettyConsole(chalk.green(`Total Balance ${chalk.yellow("$HOT🔥")}:${totalBalanceHot} ${chalk.yellow("$HOT🔥")}`))
    prettyConsole(chalk.green(`Total Balance ${chalk.cyan("$OCEAN💎")}:${totalBalanceWave} ${chalk.cyan("$OCEAN💎")}`))
    prettyConsole(chalk.green(`Total Balance ${chalk.cyan("$SUI")}:${totalBalanceSui} ${chalk.cyan("$SUI")}`))
    changeCronSchedule(minute);
}

(async () => {
    await main()
})()
