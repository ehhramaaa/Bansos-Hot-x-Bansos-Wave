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

async function main() {
    console.log(chalk.cyan(`\n<==================================[${moment().format('HH:mm:ss DD-MM-YYYY')}]==================================>`))

    const minute = Math.floor(Math.random() * (15 - 1 + 1)) + 1
    const ovpnConfig = await ovpnReadConfig(folderPath)

    mainLoop: for (let x = 0; x <= 22; x++) {

        await killApps()

        await sleep(7000)

        const ip = await checkIp()
        prettyConsole(chalk.yellow(`Current IP : ${ip}`))

        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

        // Wait for VPN connection to be established
        await new Promise(resolve => setTimeout(resolve, 5000));

        let isVpn = false;
        let vpn, browser, isContinue, isBrowser

        if (x === 22) {
            isVpn = true
        } else {
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
                        headless: false,
                        args: [
                            `--user-data-dir=${chromeUserPath}`,
                            '--profile-directory=Profile 0'
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

                await checkCommand(connectBrowser, x, "connectBrowser")
            } else {
                const connectBrowser = async () => {
                    let launchOptions = {
                        headless: false,
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

                await checkCommand(connectBrowser, x, "connectBrowser")
            }

            await sleep(3000)

            prettyConsole(chalk.green(`Profile\t:${x}`))

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            const hotWallet = true;

            if (hotWallet) {
                console.log(chalk.cyan(`\n<==================================[Bansos ${chalk.yellow('$HOT🔥')}]==================================>`))
                // Goto Link
                const gotoLink = async (x) => {
                    await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
                }

                isContinue = await checkCommand(gotoLink, x, 'Goto Link')

                if (!isContinue) {
                    break
                }

                await sleep(3000)

                // Click Claim Now
                const claimNow = async (x) => {
                    await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                    await sleep(3000)
                    await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                }

                isContinue = await checkCommand(claimNow, x, 'Click Claim Now')

                if (!isContinue) {
                    break
                }

                await sleep(3000)

                // Click Button Launch
                const buttonLaunch = async (x) => {
                    await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                    await sleep(3000)
                    await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                }

                isContinue = await checkCommand(buttonLaunch, x, 'Click Button Launch')

                if (!isContinue) {
                    break
                }

                await sleep(3000)

                // Handle iframe
                const iframeSelector = '.payment-verification';
                let iframeElementHandle
                const handleFrame = async (x) => {
                    await page.waitForSelector(iframeSelector)
                    iframeElementHandle = await page.$(iframeSelector);
                }

                isContinue = await checkCommand(handleFrame, x, 'Handle iframe')

                if (!isContinue) {
                    break
                }

                await sleep(3000)

                const iframe = await iframeElementHandle.contentFrame();

                let account

                // Get Account Name
                const getAccountName = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div > div:nth-child(1) > p');
                    account = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div > div > div:nth-child(1) > p');
                        return element.textContent
                    })
                }

                isContinue = await checkCommand(getAccountName, x, 'Get Account Name')

                if (!isContinue) {
                    break
                }

                prettyConsole(chalk.green(`Account\t:${account}`))

                let near

                // Get Near Balance
                const nearBalance = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div > div:nth-child(6) > div:nth-child(2) > div > div:nth-child(3) > p:nth-child(2)');
                    near = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div > div > div:nth-child(6) > div:nth-child(2) > div > div:nth-child(3) > p:nth-child(2)');
                        return element.textContent
                    })
                }

                await checkCommand(nearBalance, x, 'Get Near Balance')

                prettyConsole(chalk.green(`Near Balance\t:${near}`))

                let balance

                // Check Balance
                const checkBalance = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div > p');
                    balance = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div > p');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkBalance, x, 'Check Balance')

                if (!isContinue) {
                    break
                }

                prettyConsole(chalk.green(`Balance\t:${balance} ${chalk.yellow('$HOT🔥')}`))

                let storage = 0
                const threshold = 93;

                await sleep(5000)

                // Check Storage
                const checkStorage = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                    storage = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                        const height = window.getComputedStyle(element).getPropertyValue("height").match(/\d+(\.\d+)?/);
                        return Math.floor(parseFloat(height[0]))
                    });
                }

                isContinue = await checkCommand(checkStorage, x, 'Check Storage')

                if (!isContinue) {
                    break
                }

                prettyConsole(chalk.green(`Storage\t:${storage}%`))

                // Click Storage
                const clickStorage = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(2)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                    });
                }

                isContinue = await checkCommand(clickStorage, x, 'Click Storage')

                if (!isContinue) {
                    break
                }

                if (storage >= threshold) {
                    // Click Gas
                    const clickGas = async (x) => {
                        await iframe.waitForSelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                        await iframe.evaluate(() => {
                            document.querySelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                        });
                    }

                    isContinue = await checkCommand(clickGas, x, 'Click Gas')

                    if (!isContinue) {
                        break
                    }

                    // Click Tab Gas
                    const tabGas = async (x) => {
                        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)');
                        await iframe.evaluate(() => {
                            document.querySelector('#root > div > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)').click();
                        });
                    }

                    isContinue = await checkCommand(tabGas, x, 'Click Tab Gas')

                    if (!isContinue) {
                        break
                    }

                    // Wait For Counting Gas Amount
                    await sleep(10000)

                    let gasFree

                    // Check Gas Free Amount
                    const checkGas = async (x) => {
                        await iframe.waitForSelector('#root > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                        gasFree = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                            return parseFloat(element.textContent)
                        });
                    }

                    isContinue = await checkCommand(checkGas, x, 'Check Gas Free Amount')

                    if (!isContinue) {
                        break
                    }

                    prettyConsole(chalk.green(`Gas Free\t:${gasFree}`))

                    // Click Back
                    const clickBack = async (x) => {
                        await page.waitForSelector('.popup-close');
                        await page.click('.popup-close');
                    }

                    isContinue = await checkCommand(clickBack, x, 'Click Back')

                    if (!isContinue) {
                        break
                    }

                    // Click Storage
                    isContinue = await checkCommand(clickStorage, x, 'Click Storage')

                    if (!isContinue) {
                        break
                    }

                    await sleep(3000)

                    let claimed = false
                    let reClaim = 0

                    // Claim $HOT🔥
                    do {
                        if (reClaim <= 5) {
                            // Click Claim
                            const clickClaim = async (x) => {
                                const claimSelector = '#root > div > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
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
                                                const element = document.querySelector('#root > div > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                                                return parseFloat(element.textContent);
                                            });
                                        } catch (error) {
                                            prettyConsole(chalk.red(error.message))
                                        }

                                        await sleep(5000)

                                        if (checkCommand === 5) {
                                            prettyConsole(chalk.yellow(`Still Claiming ${chalk.yellow('$HOT🔥')}`))
                                        }


                                        tryMakeSure++
                                    } else {
                                        prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT🔥')} Successfully!`))
                                        prettyConsole(chalk.green(`Update Balance\t:${balanceAfter} ${chalk.yellow('$HOT🔥')}`))
                                        makeSure = true
                                        claimed = true
                                    }
                                } else {
                                    // Tweak if not claimed with clicking boost
                                    prettyConsole(chalk.red(`Claiming ${chalk.yellow('$HOT🔥')} So Take Long Time, Tweaking`))

                                    // Click Boost
                                    const clickBoost = async (x) => {
                                        await iframe.waitForSelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                                        account = await iframe.evaluate(() => {
                                            document.querySelector('#root > div > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                                        })
                                    }

                                    isContinue = await checkCommand(clickBoost, x, 'Click Boost')

                                    if (!isContinue) {
                                        break
                                    }

                                    await sleep(5000)

                                    tweak = false

                                    // Click Back
                                    const clickBack = async (x) => {
                                        await page.waitForSelector('.btn-icon.popup-close');
                                        await page.click('.btn-icon.popup-close');
                                    }

                                    isContinue = await checkCommand(clickBack, x, 'Click Back')

                                    if (!isContinue) {
                                        break
                                    }

                                    prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT🔥')}`))
                                    reClaim++
                                    makeSure = true
                                }
                            } while (makeSure === false)

                            balance = balanceAfter
                        } else {
                            prettyConsole(chalk.red(`After Reclaim ${reClaim}x Still Not Claimed, Switch To Upgrade`))
                            claimed = true
                        }
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
            if (waveWallet) {
                const wavePage = await browser.newPage()
                console.log(chalk.cyan(`\n<==================================[Bansos ${chalk.cyan('Wave💎')}]==================================>`))
                // Goto Link
                const gotoLink = async () => {
                    await wavePage.goto('https://web.telegram.org/k/#@waveonsuibot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
                }

                isContinue = await checkCommand(gotoLink, x, 'gotoLink')

                if (!isContinue) {
                    await killApps()
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
                    await killApps()
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
                    await killApps()
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
                    await killApps()
                    await rest()
                    continue mainLoop
                }

                await sleep(3000)

                const iframe = await iframeElementHandle.contentFrame();

                // Click Claim Now
                const claimNow = async () => {
                    await iframe.waitForSelector('#section-home > div > div > div.block-claim.flex.flex-row.relative.z-0 > div.item-1 > div._item-1_2 > div.ml-auto.mt-3 > button');
                    await iframe.evaluate(() => {
                        document.querySelector('#section-home > div > div > div.block-claim.flex.flex-row.relative.z-0 > div.item-1 > div._item-1_2 > div.ml-auto.mt-3 > button').click();
                    });
                }

                isContinue = await checkCommand(claimNow, x, 'Click Claim Now')

                if (!isContinue) {
                    await killApps()
                    await rest()
                    continue mainLoop
                }

                let balance

                // Check Balance
                const checkBalance = async (x) => {
                    await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.flex.item-bl-1.flex-row.items-center > div.left.relative > p');
                    balance = await iframe.evaluate(() => {
                        const element = document.querySelector('#section-transaction > div.block-data.h-full > div > div.flex.item-bl-1.flex-row.items-center > div.left.relative > p');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkBalance, x, 'Check Balance')

                if (!isContinue) {
                    await killApps()
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Balance\t:${balance} ${chalk.cyan('Wave💎')}`))

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
                    await killApps()
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Speed\t:${speed}/Hours`))

                let storage

                // Check Speed
                const checkStorage = async (x) => {
                    await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                    storage = await iframe.evaluate(() => {
                        const element = document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_2.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkCommand(checkStorage, x, 'Check Speed')

                if (!isContinue) {
                    await killApps()
                    await rest()
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Storage\t:${storage} ${chalk.cyan('Wave💎')}`))

                let claim = false

                // Check Claim Button
                try {
                    await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > div.flex.flex-row.items-center.item-2.mt-2.mb-3 > div > div');
                    claim = true
                } catch (error) {
                    let claimTime

                    // Check Claim Time
                    const checkClaimTime = async (x) => {
                        await iframe.waitForSelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                        claimTime = await iframe.evaluate(() => {
                            const element = document.querySelector('#section-transaction > div.direction-tab.flex.flex-col.items-center.gap-6.pt-4 > div.menu-block > div > div.menu_1.relative > div.menu_title.flex.flex-row.justify-between.items-center.absolute > div > span.time');
                            return parseFloat(element.textContent)
                        });
                    }

                    isContinue = await checkCommand(checkClaimTime, x, 'Check Claim Time')

                    if (!isContinue) {
                        await killApps()
                        await rest()
                        continue mainLoop
                    }

                    prettyConsole(chalk.yellow(`Claim Countdown\t:${claimTime}`))
                }

                if (claim) {
                    let claimed = false
                    let reclaim = 0

                    do {
                        // Click Claim Button
                        const claimWaveButton = async () => {
                            await iframe.evaluate(() => {
                                document.querySelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > div.flex.flex-row.items-center.item-2.mt-2.mb-3 > div > div').click();
                            });
                        }

                        isContinue = await checkCommand(claimWaveButton, x, 'Claim Wave')

                        if (!isContinue) {
                            await killApps()
                            await rest()
                            continue mainLoop
                        }

                        prettyConsole(chalk.green(`Claiming ${chalk.cyan('Wave💎')}......`))

                        let checkClaim

                        // Check Status Claim
                        do {
                            try {
                                await iframe.waitForSelector('#section-transaction > div.block-data.h-full > div > div.overlay.relative > div > div > div > div.ml-2.flex.flex-row.items-center.item.mt-2.mb-3 > span');
                                claimed = true;
                            } catch (error) {
                                prettyConsole(chalk.yellow(`Still Claiming ${chalk.cyan('Wave💎')}......`))
                                checkClaim++
                            }
                        } while (checkClaim < 3 && !claimed)

                        // Tweaking
                        if (!claimed) {
                            prettyConsole(chalk.yellow(`Claiming ${chalk.cyan('Wave💎')} Failed!, Tweaking`))

                            // Click Back
                            const clickBack = async () => {
                                await wavePage.waitForSelector('.popup-close');
                                await wavePage.click('.popup-close');
                            }

                            isContinue = await checkCommand(clickBack, x, 'Click Back')

                            if (!isContinue) {
                                await killApps()
                                await rest()
                                continue mainLoop
                            }

                            isContinue = await checkCommand(claimNow, x, 'Click Claim Now')

                            if (!isContinue) {
                                await killApps()
                                await rest()
                                continue mainLoop
                            }

                            reclaim++
                        }
                    } while (!claimed && reclaim < 3)

                    if (claimed) {
                        prettyConsole(chalk.green(`Successfully Claim ${chalk.cyan('Wave💎')}`))
                    } else {
                        prettyConsole(chalk.red("Claiming And Tweaking Failed!"))
                    }
                }
            }

            await killApps()
            await rest()
        }
    }

    changeCronSchedule(minute);
}

(async () => {
    await main()
})()
