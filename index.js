#!/usr/bin/env node


const { resolve, dirname, relative } = require('path')
const fs = require('fs')
const currentAbsPath = process.cwd()
const cofigName = '.gitidentity.json'
const { execSync } = require('child_process')
const localExcludeDir = ['node_modules', 'dist', 'lib', 'types', "gi"]

const log = (message) => {
  const template = `[gi|${new Date().toLocaleTimeString()}]${message}`
  console.log(template)
}

const getConfig = (path) => {

  const configPath = resolve(path, cofigName)

  const isExists = fs.existsSync(configPath)

  if (isExists) {
    try {
      const gitConfig = JSON.parse(fs.readFileSync(configPath).toString())

      return gitConfig
    } catch (err) {
      throw err
      process.exit(0)
    }
  } else {

    const newPath = resolve(path, '../')

    if (newPath === path) return null
    getConfig(newPath)
  }

}

const isDirectory = (path) => {
  return fs.lstatSync(path).isDirectory()
}

const isRepository = (path) => {
  return fs.existsSync(resolve(path, '.git'));
}

const setGitUserInfo = (path, key, value) => {
  return execSync(`cd ${path} && git config user.${key} ${value}`).toString().trim()
}


const getGitUserInfo = (path, key) => {
  return execSync(`cd ${path} && git config user.${key}`).toString().trim()
}


const updateGitUserInfoIfNeed = (path, { name, email }) => {
  // 当前目录是git仓库， 则只设置当前的仓库
  const gitEmail = getGitUserInfo(path, 'email')
  const gitName = getGitUserInfo(path, 'name')

  const relativePath = relative(currentAbsPath, path) || './'

  let result = false

  if (name !== gitName) {
    log(`✅ ${relativePath} 【name】${gitName} => ${name}`)
    setGitUserInfo(path, 'name', name)
    result = true
  }

  if (email !== gitEmail) {
    log(`✅ ${relativePath} 【email】${gitEmail} => ${email}`)
    setGitUserInfo(path, 'email', email)

    result = true
  }

  return result
}


const eachChildRepository = (entryPath, callback, { excludeDir = [], level = 1 }) => {
  if (!level) return
  const dirList = fs.readdirSync(entryPath).filter(v => {
    return !excludeDir.includes(v) && isDirectory(v);
  })


  dirList.forEach(path => {
    const targetPath = resolve(entryPath, path)

    if (isRepository(targetPath)) {
      callback(targetPath)
    } else {
      eachChildRepository(targetPath, callback, { excludeDir, level: level - 1 })
    }
  })
}

function main() {
  const config = getConfig(currentAbsPath)

  if (!config) return log('❎未找到配置文件')

  const { name, email, level = 1, excludeDir = [] } = config

  let isSetted = false

  if (isRepository(currentAbsPath)) {
    // 当前目录是git仓库， 则只设置当前的仓库
    isSetted = updateGitUserInfoIfNeed(currentAbsPath, { name, email })
  } else {
    // 当前仓库不是git仓库， 则搜索该目录的子级目录
    eachChildRepository(currentAbsPath, (repoPath) => {
      const result = updateGitUserInfoIfNeed(repoPath, { name, email })
      if(result){
        isSetted = true
      }
    },
      {
        excludeDir: [...localExcludeDir, ...excludeDir],
        level
      }
    )
  }

  if(isSetted) {
    log('更新git信息完成')
  }else{
    log('暂无需要更新信息')
  }

}

main()
