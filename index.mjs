// 定義顏色
const Colors = {
    NoColor: '\x1b[0m',
    Disable: '\x1b[31m',
    Enable: '\x1b[34m'
}
// 定義啟用停用字串
const Status = {
    Enable: 'feature-toggle(enable)',
    Disable: 'feature-toggle(disable)'
}

// 要merge的頭點
const headCommit = argv.h || 'origin/lab'

// branch name
const branchName = argv.b || 'to-staging'

// debug mode
const showMessage = argv.debug || false
$.verbose = showMessage

// 最後的訊息 disable enable 訊息
const statusMessage = commit => {
    return commit.status ? commit.origStatus ? '' : `${Status.Enable}: ` : `${Status.Disable}: `
}
// 顯示用disabled enable訊息
const consoleStatusMessage = commit => {
    const EnableConsoleMessage = `${Colors.Enable}${Status.Enable}${Colors.NoColor}: `
    const DisableConsoleMessage = `${Colors.Disable}${Status.Disable}${Colors.NoColor}: `
    if (commit.status) {
        return commit.isToggle ? EnableConsoleMessage : ''
    } else {
        return DisableConsoleMessage
    }
}
// format commit object
const formatCommit = commitString => {
    const [hash, content] = commitString.split('<|>')
    // clean toggle message
    let pureContent = content.replace(`${Status.Disable}: `, '')
    pureContent = pureContent.replace(`${Status.Enable}: `, '')
    return {
        hash,
        content: pureContent,
        isToggle: content.includes(Status.Enable),
        origStatus: !content.includes(Status.Disable),
        status: !content.includes(Status.Disable)
    }
}

// =============================================== 以下主流程開始  =======================================================
// 刪除local車
try {
    await $`git branch -D ${branchName}`
} catch(e) {}
// 先建車
await $`git branch ${branchName}`
await $`git checkout ${branchName}`
// 取得目前commit點
const origCommit =  (await $`git log --pretty=format:'%H' -n 1`).stdout
// 取得上一次merge點範圍
const [lastMergeEnd, lastMergeStart] = (await $`git log --pretty=format:'%H' -n 2 --merges`).stdout.split('\n')
// 抓上一次範圍內的disable commits
const lastDisableCommits = (await $`git log ${lastMergeStart}..${lastMergeEnd} --pretty=format:'%H<|>%s'`).stdout
    .split('\n')
    .map(commitString => formatCommit(commitString))
    .filter(commit => !commit.status)
if (showMessage) console.log('上次被關閉的點', lastDisableCommits)
// 依序enable
for (const commit of lastDisableCommits) {
    const message = `${Status.Enable}: ${commit.content}`
    // revert
    await $`git revert --no-commit  ${commit.hash}`
    await $`git commit -m ${message}`
}
// 從目標merge
await $`git merge ${headCommit}`
// 取得commits點
let commits = (await $`git log ${origCommit}..HEAD --pretty=format:'%H<|>%s'`).stdout
    .split('\n')
    .map(commit => formatCommit(commit))
// 開始迴圈編輯點
let choose = null
while (choose != 'ok') {
    if (!showMessage) console.clear()
    console.log('輸入編號來切換點的狀態, 輸入ok完成編輯')
    commits.forEach((commit, index) => {
        console.log(`${index}. ${commit.hash}: ${consoleStatusMessage(commit)}${commit.content}`)
    })
    choose = await question('index(can be 0,1,2 or 1) or ok：')
    try {
        const indexs = choose.split(',')
        indexs.forEach(index => {
            commits[index].status = !commits[index].status
        })
    } catch (e) {
    }
}
// 照順序 revert 與原狀態不同的點
for (const commit of commits) {
    if (commit.status !== commit.origStatus) {
        const message = `${statusMessage(commit)}${commit.content}`
        // revert
        await $`git revert --no-commit  ${commit.hash}`
        await $`git commit -m ${message}`
    }
}

console.log('done')



