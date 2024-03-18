local QBCore = exports['qb-core']:GetCoreObject()
local phoneProp = 0
local phoneModel = 'prop_npc_phone_02'
local isOpen = false
local callType = nil
local callId = nil
local inCall = false
local answeredCall = false
local contacts = {}
local chats = {}
local tweets = {}
local targetData = {}
local recentCalls = {}
local garageVehicles = {}
local ownedHouses = {}
local muted = false
local MetaData = {}
local AnimationData = {
    lib = nil,
    anim = nil
}

-- Functions
local function LoadAnimation(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(1)
    end
end

local function toggleNuiFrame(shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    SendReactMessage('setVisible', shouldShow)
end

local function CalculateTimeToDisplay()
    local hour = GetClockHours()
    local minute = GetClockMinutes()

    local obj = {}

    if minute <= 9 then
        minute = '0' .. minute
    end

    obj.hour = hour
    obj.minute = minute

    return obj
end

local function ReorganizeChats(key)
    local ReorganizedChats = {}
    ReorganizedChats[1] = chats[key]
    for k, chat in pairs(chats) do
        if k ~= key then
            ReorganizedChats[#ReorganizedChats + 1] = chat
        end
    end
    chats = ReorganizedChats
end

local function GetKeyByDate(Number, Date)
    local retval = nil
    if chats[Number] ~= nil then
        if chats[Number].messages ~= nil then
            for key, chat in pairs(chats[Number].messages) do
                if chat.date == Date then
                    retval = key
                    break
                end
            end
        end
    end
    return retval
end

local function GetKeyByNumber(Number)
    local retval = nil
    if chats then
        for k, v in pairs(chats) do
            if v.number == Number then
                retval = k
            end
        end
    end
    return retval
end

local function IsNumberInContacts(num)
    local retval = num
    for _, v in pairs(contacts) do
        if num == v.number then
            retval = v.name
        end
    end
    return retval
end

local function CheckAnimLoop()
    CreateThread(function()
        while AnimationData.lib ~= nil and AnimationData.anim ~= nil do
            local ped = PlayerPedId()
            if not IsEntityPlayingAnim(ped, AnimationData.lib, AnimationData.anim, 3) then
                LoadAnimation(AnimationData.lib)
                TaskPlayAnim(ped, AnimationData.lib, AnimationData.anim, 3.0, 3.0, -1, 50, 0, false, false, false)
            end
            Wait(500)
        end
    end)
end

local function AnswerCall(number)
    if (callType == 'incoming' or callType == 'outgoing') and inCall and not answeredCall then
        callType = 'ongoing'
        answeredCall = true

        TriggerServerEvent('ecrp-phone:server:SetCallState', true)

        if isOpen then
            DoPhoneAnimation('cellphone_text_to_call')
        else
            DoPhoneAnimation('cellphone_call_listen_base')
        end

        TriggerServerEvent('ecrp-phone:server:AnswerCall', number)
        exports['pma-voice']:addPlayerToCall(callId)
        return true
    else
        inCall = false
        callType = nil
        answeredCall = false
        return false
    end
end

local function findVehFromPlateAndLocate(plate)
    local gameVehicles = QBCore.Functions.GetVehicles()
    for i = 1, #gameVehicles do
        local vehicle = gameVehicles[i]
        if DoesEntityExist(vehicle) then
            if QBCore.Functions.GetPlate(vehicle) == plate then
                local vehCoords = GetEntityCoords(vehicle)
                SetNewWaypoint(vehCoords.x, vehCoords.y)
                return true
            end
        end
    end
end

function newPhoneProp()
    deletePhone()
    RequestModel(phoneModel)
    while not HasModelLoaded(phoneModel) do
        Wait(1)
    end
    phoneProp = CreateObject(phoneModel, 1.0, 1.0, 1.0, 1, 1, 0)

    local bone = GetPedBoneIndex(PlayerPedId(), 28422)
    if phoneModel == 'prop_cs_phone_01' then
        AttachEntityToEntity(phoneProp, PlayerPedId(), bone, 0.0, 0.0, 0.0, 50.0, 320.0, 50.0, 1, 1, 0, 0, 2, 1)
    else
        AttachEntityToEntity(phoneProp, PlayerPedId(), bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
    end
end

function deletePhone()
    if phoneProp ~= 0 then
        DeleteObject(phoneProp)
        phoneProp = 0
    end
end

function DoPhoneAnimation(anim)
    local ped = PlayerPedId()
    local AnimationLib = 'cellphone@'
    local AnimationStatus = anim
    if IsPedInAnyVehicle(ped, false) then
        AnimationLib = 'anim@cellphone@in_car@ps'
    end
    LoadAnimation(AnimationLib)
    TaskPlayAnim(ped, AnimationLib, AnimationStatus, 3.0, 3.0, -1, 50, 0, false, false, false)
    AnimationData.lib = AnimationLib
    AnimationData.anim = AnimationStatus
    CheckAnimLoop()
end

local function CancelCall(number)
    TriggerServerEvent('ecrp-phone:server:CancelCall', number)
    if callType == 'ongoing' then
        exports['pma-voice']:removePlayerFromCall(callId)
    end

    callType = nil
    inCall = false
    answeredCall = false
    targetData = {}
    callId = nil

    SendReactMessage("EndCall")
    if not isOpen then
        StopAnimTask(PlayerPedId(), AnimationData.lib, AnimationData.anim, 2.5)
        deletePhone()
        AnimationData.lib = nil
        AnimationData.anim = nil
    else
        AnimationData.lib = nil
        AnimationData.anim = nil
    end

    TriggerServerEvent('ecrp-phone:server:SetCallState', false)
end

local function LoadPhone()
    Wait(100)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPhoneData', function(pData)
        local PhoneMeta = QBCore.Functions.GetPlayerData().metadata['phone']
        MetaData = PhoneMeta
        if pData.PlayerContacts ~= nil and next(pData.PlayerContacts) ~= nil then
            contacts = pData.PlayerContacts
        end

        if pData.Chats ~= nil and next(pData.Chats) ~= nil then
            local Chats = {}
            for _, v in pairs(pData.Chats) do
                Chats[v.number] = {
                    name = IsNumberInContacts(v.number),
                    number = v.number,
                    messages = json.decode(v.messages)
                }
            end

            chats = Chats
        end

        if pData.Tweets ~= nil and next(pData.Tweets) ~= nil then
            tweets = pData.Tweets
        end

        muted = MetaData.muted
        SendReactMessage("UpdateBG", MetaData.background)
        SendReactMessage("UpdateMuted", MetaData.muted)
        SendReactMessage("UpdateMutedNoti", MetaData.mutedNoti)
        SendReactMessage('myCitizenid', QBCore.Functions.GetPlayerData().citizenid)
        SendReactMessage('myPhoneNumber', QBCore.Functions.GetPlayerData().charinfo.phone)
        SendReactMessage('UpdateContacts', contacts)
        SendReactMessage('UpdateChat', chats)
    end)
end

local function GenerateCallId(caller, target)
    local CallId = math.ceil(((tonumber(caller) + tonumber(target)) / 100 * 1))
    return CallId
end

-- NUI Callbacks
RegisterNUICallback('hideFrame', function(_, cb)
    toggleNuiFrame(false)
    isOpen = false
    if callType == nil then
        StopAnimTask(PlayerPedId(), AnimationData.lib, AnimationData.anim, 2.5)
        deletePhone()
        AnimationData.lib = nil
        AnimationData.anim = nil
    end
    cb({})
end)

RegisterNUICallback('GetProfilePicture', function(data, cb)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPicture', function(picture)
        cb(picture)
    end, data)
end)

RegisterNUICallback('SendMessage', function(data, cb)
    local ChatMessage = data.ChatMessage
    local ChatDate = data.ChatDate
    local ChatNumber = data.ChatNumber
    local ChatTime = data.ChatTime
    local ChatType = data.ChatType
    local NumberKey = GetKeyByNumber(ChatNumber)
    local ChatKey = GetKeyByDate(NumberKey, ChatDate)
    if chats[NumberKey] ~= nil then
        if (chats[NumberKey].messages == nil) then
            chats[NumberKey].messages = {}
        end
        if chats[NumberKey].messages[ChatKey] ~= nil then

            chats[NumberKey].messages[ChatKey].messages[#chats[NumberKey].messages[ChatKey].messages + 1] = {
                message = ChatMessage,
                time = ChatTime,
                sender = QBCore.Functions.GetPlayerData().citizenid,
                type = ChatType,
                data = {}
            }

            TriggerServerEvent('ecrp-phone:server:UpdateMessages', chats[NumberKey].messages, ChatNumber, false)
            NumberKey = GetKeyByNumber(ChatNumber)
            ReorganizeChats(NumberKey)
        else
            chats[NumberKey].messages[#chats[NumberKey].messages + 1] = {
                date = ChatDate,
                messages = {}
            }
            ChatKey = GetKeyByDate(NumberKey, ChatDate)

            chats[NumberKey].messages[ChatKey].messages[#chats[NumberKey].messages[ChatKey].messages + 1] = {
                message = ChatMessage,
                time = ChatTime,
                sender = QBCore.Functions.GetPlayerData().citizenid,
                type = ChatType,
                data = {}
            }

            TriggerServerEvent('ecrp-phone:server:UpdateMessages', chats[NumberKey].messages, ChatNumber, true)
            NumberKey = GetKeyByNumber(ChatNumber)
            ReorganizeChats(NumberKey)
        end
    else
        chats[#chats + 1] = {
            name = IsNumberInContacts(ChatNumber),
            number = ChatNumber,
            messages = {}
        }
        NumberKey = GetKeyByNumber(ChatNumber)
        chats[NumberKey].messages[#chats[NumberKey].messages + 1] = {
            date = ChatDate,
            messages = {}
        }
        ChatKey = GetKeyByDate(NumberKey, ChatDate)

        chats[NumberKey].messages[ChatKey].messages[#chats[NumberKey].messages[ChatKey].messages + 1] = {
            message = ChatMessage,
            time = ChatTime,
            sender = QBCore.Functions.GetPlayerData().citizenid,
            type = ChatType,
            data = {}
        }

        TriggerServerEvent('ecrp-phone:server:UpdateMessages', chats[NumberKey].messages, ChatNumber, true)
        NumberKey = GetKeyByNumber(ChatNumber)
        ReorganizeChats(NumberKey)
    end

    QBCore.Functions.TriggerCallback('ecrp-phone:server:GetContactPicture', function(Chat)
        SendReactMessage("UpdateChat", {
            chatData = Chat,
            chatNumber = ChatNumber
        })
    end, chats[GetKeyByNumber(ChatNumber)])
    cb('ok')
end)

RegisterNuiCallback("callNumber", function(data, cb)
    if tonumber(QBCore.Functions.GetPlayerData().charinfo.phone) ~= tonumber(data) then
        cb('ok')
        local RepeatCount = 0
        callType = "outgoing"
        inCall = true

        callId = GenerateCallId(QBCore.Functions.GetPlayerData().charinfo.phone, data)

        TriggerServerEvent('ecrp-phone:server:CallContact', data, callId)
        TriggerServerEvent('ecrp-phone:server:SetCallState', true)

        for _ = 1, 10 + 1, 1 do
            if not answeredCall then
                if RepeatCount + 1 ~= 10 + 1 then
                    if inCall then
                        RepeatCount = RepeatCount + 1
                        if not muted then
                            TriggerEvent('InteractSound_CL:PlayOnOne', 'dialing', 0.2)
                        end
                    else
                        break
                    end
                    Wait(4000)
                else
                    CancelCall()
                    break
                end
            end
        end

    end
end)

RegisterNuiCallback("msgNumber", function(data, cb)
    SendReactMessage("startNewMessage", data)
end)

RegisterNuiCallback("endCall", function(number, cb)
    CancelCall(number)
    cb({})
end)

RegisterNuiCallback('answerCall', function(data, cb)
    local answer = AnswerCall(data)
    cb(answer)
end)

RegisterNUICallback('getRecentCalls', function(_, cb)
    if (#recentCalls > 0) then
        cb(recentCalls)
    end
end)

RegisterNUICallback('SetupGarageVehicles', function(_, cb)
    cb(garageVehicles)
end)

RegisterNUICallback('SetupProperties', function(_, cb)
    cb(ownedHouses)
end)

RegisterNUICallback('GetBankBalance', function(_, cb)
    cb(QBCore.Functions.GetPlayerData().money.bank)
end)

RegisterNuiCallback("TransferMoney", function(data, cb)
    local amount = tonumber(data.amount)
    local bal = tonumber(QBCore.Functions.GetPlayerData().money.bank)
    if bal >= amount then
        local newmoney = QBCore.Functions.GetPlayerData().money.bank - amount
        TriggerServerEvent("ecrp-phone:server:TransferMoney", amount, data.stateId)
        SendReactMessage("UpdateBank", newmoney)
        SendReactMessage("SetNoti", {
            open = true,
            icon = "bank",
            iconBg = "from-cyan-600 to-emerald-600",
            header = "Wallet",
            subheader = 'Transfer sent!',
            type = "noti",
            timeout = 2000
        })
        cb('true')
    else
        SendReactMessage("SetNoti", {
            open = true,
            icon = "bank",
            iconBg = "from-cyan-600 to-emerald-600",
            header = 'Wallet',
            subheader = 'Not enough money!',
            type = "noti",
            timeout = 2000
        })
        cb('false')
    end
end)

RegisterNuiCallback("ChargePlayer", function(data, cb)
    local amount = tonumber(data.amount)
    local bal = tonumber(QBCore.Functions.GetPlayerData().money.bank)
    TriggerServerEvent("ecrp-phone:server:ChargePlayer", amount, data.stateId)
end)

RegisterNUICallback('PayCharge', function(data, cb)
    local bal = tonumber(QBCore.Functions.GetPlayerData().money.bank)

    if bal >= data.amount then
        TriggerServerEvent('ecrp-phone:server:AcceptCharge', data.amount, data.cid)
    else
        SendReactMessage("SetNoti", {
            open = true,
            icon = "bank",
            iconBg = "from-cyan-600 to-emerald-600",
            header = 'Wallet',
            subheader = 'Not enough money!',
            type = "noti",
            timeout = 2000
        })
    end
end)

RegisterNUICallback('DeclineCharge', function(data, cb)
    TriggerServerEvent('ecrp-phone:server:DeclineCharge', data.cid)
end)

RegisterNUICallback('AddNewContact', function(data)
    contacts[#contacts + 1] = {
        name = data.name,
        number = data.number,
        iban = data.iban
    }
    Wait(100)
    if chats[data.number] ~= nil and next(chats[data.number]) ~= nil then
        chats[data.number].name = data.name
    end
    TriggerServerEvent('ecrp-phone:server:AddNewContact', data.name, data.number, data.iban)
end)

RegisterNUICallback('RemoveContact', function(data)
    local Name = data.name
    local Number = data.number

    for k, v in pairs(contacts) do
        if v.name == Name and v.number == Number then
            table.remove(contacts, k)
            break
        end
    end
    Wait(100)
    if chats[Number] ~= nil and next(chats[Number]) ~= nil then
        chats[Number].name = Number
    end
    TriggerServerEvent('ecrp-phone:server:RemoveContact', Name, Number)
end)

RegisterNUICallback('EditContact', function(data, cb)
    local NewName = data.name
    local NewNumber = data.number
    local NewIban = data.iban
    local OldName = data.oldName
    local OldNumber = data.oldNumber
    local OldIban = data.oldIban
    for _, v in pairs(contacts) do
        if v.name == OldName and v.number == OldNumber then
            v.name = NewName
            v.number = NewNumber
            v.iban = NewIban
        end
    end
    if chats[NewNumber] ~= nil and next(chats[NewNumber]) ~= nil then
        chats[NewNumber].name = NewName
    end
    Wait(100)
    cb(contacts)
    TriggerServerEvent('ecrp-phone:server:EditContact', NewName, NewNumber, NewIban, OldName, OldNumber, OldIban)
end)

RegisterNUICallback("SetMuted", function(data)
    muted = data
end)

RegisterNUICallback("SaveSettings", function(data)
    local background = data.background
    local muted = data.muted
    local mutedNoti = data.mutedNoti
    MetaData.background = background
    MetaData.muted = muted
    MetaData.mutedNoti = mutedNoti
    TriggerServerEvent('ecrp-phone:server:SaveSettings', MetaData)
end)

RegisterNUICallback('trackVehicle', function(plate, cb)
    if findVehFromPlateAndLocate(plate) then
        QBCore.Functions.Notify('Your vehicle has been marked', 'success')
    else
        QBCore.Functions.Notify('This vehicle cannot be located', 'error')
    end
    cb('ok')
end)

RegisterNUICallback('locateProperty', function(data, cb)
    SetNewWaypoint(data.x, data.y)
    cb('ok')
end)

RegisterNUICallback("GetDirectoryPosts", function(data, cb)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:GetDirectoryPosts', function(Posts)
        cb(Posts)
    end)
end)

RegisterNUICallback("NewDirectoryPost", function(message, cb)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:NewDirectoryPost', function(result)
        cb(result)
    end, message)
end)

RegisterNUICallback("NewTwinstaPost", function(message, cb)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:NewTwinstaPost', function(result)
        cb(result)
    end, message)
end)

RegisterNUICallback("DeleteDirectoryPost", function(cid, cb)
    TriggerServerEvent("ecrp-phone:server:DeleteDirectoryPost", cid)
    cb('ok')
end)

RegisterNUICallback("GetPlayerJobs", function(_, cb)
    QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPlayerJobs', function(result)
        cb(result)
    end)
end)

-- Events
RegisterNetEvent('ecrp-phone:client:GetCalled', function(CallerNumber, CallId)
    local RepeatCount = 0
    local CallData = {
        number = CallerNumber,
        name = IsNumberInContacts(CallerNumber)
    }

    callType = 'incoming'
    inCall = true
    answeredCall = false
    targetData = CallData
    callId = CallId

    TriggerServerEvent('ecrp-phone:server:SetCallState', true)

    for _ = 1, 10 + 1, 1 do
        if not answeredCall then
            if RepeatCount + 1 ~= 10 + 1 then
                if inCall then
                    QBCore.Functions.TriggerCallback('ecrp-phone:server:HasPhone', function(HasPhone)
                        if HasPhone then
                            RepeatCount = RepeatCount + 1
                            if not muted then
                                TriggerServerEvent('InteractSound_SV:PlayOnSource', 'ringing', 0.2)
                            end

                            SendReactMessage('IncomingCallAlert', {
                                callData = targetData,
                                canceled = false
                            })
                        end
                    end)
                else
                    SendReactMessage('IncomingCallAlert', {
                        CallData = targetData,
                        canceled = true
                    })
                    TriggerServerEvent('ecrp-phone:server:AddRecentCall', 'missed', CallData)
                    break
                end
                Wait(2000)
            else
                SendReactMessage('IncomingCallAlert', {
                    CallData = targetData,
                    canceled = true
                })
                TriggerServerEvent('ecrp-phone:server:AddRecentCall', 'missed', CallData)
                break
            end
        else
            TriggerServerEvent('ecrp-phone:server:AddRecentCall', 'answered', CallData)
            break
        end
    end
end)

RegisterNetEvent('ecrp-phone:client:AddRecentCall', function(data, time, type)
    recentCalls[#recentCalls + 1] = {
        name = IsNumberInContacts(data.number),
        time = time,
        type = type,
        number = data.number
    }
end)

RegisterNetEvent('ecrp-phone:client:AnswerCall', function()
    if (callType == 'incoming' or callType == 'outgoing') and inCall and not answeredCall then
        callType = 'ongoing'
        answeredCall = true

        TriggerServerEvent('ecrp-phone:server:SetCallState', true)

        if isOpen then
            DoPhoneAnimation('cellphone_text_to_call')
        else
            DoPhoneAnimation('cellphone_call_listen_base')
        end

        SendReactMessage("setInCall")
        exports['pma-voice']:addPlayerToCall(callId)
    else
        inCall = false
        callType = nil
        answeredCall = false
    end
end)

RegisterNetEvent('ecrp-phone:client:CancelCall', function()
    if callType == 'ongoing' then
        exports['pma-voice']:removePlayerFromCall(callId)
    end
    callType = nil
    inCall = false
    answeredCall = false
    targetData = {}

    if not isOpen then
        StopAnimTask(PlayerPedId(), AnimationData.lib, AnimationData.anim, 2.5)
        deletePhone()
        AnimationData.lib = nil
        AnimationData.anim = nil
    else
        AnimationData.lib = nil
        AnimationData.anim = nil
    end

    TriggerServerEvent('ecrp-phone:server:SetCallState', false)

    SendReactMessage("EndCall")
end)

RegisterNetEvent('ecrp-phone:client:UpdateMessages', function(ChatMessages, SenderNumber, New)
    local NumberKey = GetKeyByNumber(SenderNumber)

    if New then
        chats[#chats + 1] = {
            name = IsNumberInContacts(SenderNumber),
            number = SenderNumber,
            messages = {}
        }

        NumberKey = GetKeyByNumber(SenderNumber)

        chats[NumberKey] = {
            name = IsNumberInContacts(SenderNumber),
            number = SenderNumber,
            messages = ChatMessages
        }

        if chats[NumberKey].Unread ~= nil then
            chats[NumberKey].Unread = chats[NumberKey].Unread + 1
        else
            chats[NumberKey].Unread = 1
        end

        if SenderNumber ~= QBCore.Functions.GetPlayerData().charinfo.phone then
            SendReactMessage("SetNoti", {
                open = true,
                icon = "phone",
                iconBg = "from-emerald-600 to-cyan-600",
                header = 'Messages',
                subheader = 'New message from ' .. IsNumberInContacts(SenderNumber) .. '!',
                type = "noti",
                timeout = 2000
            })
        else
            SendReactMessage("SetNoti", {
                open = true,
                icon = "phone",
                iconBg = "from-emerald-600 to-cyan-600",
                header = 'Messages',
                subheader = 'Cannot message yourself!',
                type = "noti",
                timeout = 2000
            })
        end

        NumberKey = GetKeyByNumber(SenderNumber)
        ReorganizeChats(NumberKey)

        Wait(100)
        QBCore.Functions.TriggerCallback('ecrp-phone:server:GetContactPictures', function(Chats)
            SendReactMessage("UpdateChat", {
                chatData = Chats[GetKeyByNumber(SenderNumber)],
                chatNumber = SenderNumber,
                Chats = Chats
            })

            SendReactMessage("updateSelectedChat", Chats[GetKeyByNumber(SenderNumber)])
        end, chats)
    else
        chats[NumberKey].messages = ChatMessages

        if chats[NumberKey].Unread ~= nil then
            chats[NumberKey].Unread = chats[NumberKey].Unread + 1
        else
            chats[NumberKey].Unread = 1
        end

        if SenderNumber ~= QBCore.Functions.GetPlayerData().charinfo.phone then
            SendReactMessage("SetNoti", {
                open = true,
                icon = "phone",
                iconBg = "from-emerald-600 to-cyan-600",
                header = 'Messages',
                subheader = 'New message from ' .. IsNumberInContacts(SenderNumber) .. '!',
                type = "noti",
                timeout = 2000
            })
        else
            SendReactMessage("SetNoti", {
                open = true,
                icon = "phone",
                iconBg = "from-emerald-600 to-cyan-600",
                header = 'Messages',
                subheader = 'Cannot message yourself',
                type = "noti",
                timeout = 2000
            })
        end

        NumberKey = GetKeyByNumber(SenderNumber)
        ReorganizeChats(NumberKey)

        Wait(100)
        QBCore.Functions.TriggerCallback('ecrp-phone:server:GetContactPictures', function(Chats)
            SendReactMessage("UpdateChat", {
                chatData = Chats[GetKeyByNumber(SenderNumber)],
                chatNumber = SenderNumber,
                Chats = Chats
            })

            SendReactMessage("updateSelectedChat", Chats[GetKeyByNumber(SenderNumber)])
        end, chats)
    end
end)

RegisterNetEvent("ecrp-phone:client:RequestInvoice", function(amount, cid)
    SendReactMessage("SetNoti", {
        open = true,
        icon = "bank",
        iconBg = "from-cyan-600 to-emerald-600",
        header = 'Wallet',
        subheader = 'Bill $' .. amount,
        type = "noti",
        buttons = true,
        accept = "PayCharge",
        decline = "DeclineCharge",
        props = {
            amount = amount,
            cid = cid
        }
    })
end)

RegisterNetEvent('ecrp-phone:client:TransferMoney', function(amount, newmoney)
    QBCore.Functions.GetPlayerData().money.bank = newmoney
    SendReactMessage("SetNoti", {
        open = true,
        icon = "bank",
        iconBg = "from-cyan-600 to-emerald-600",
        header = 'Wallet',
        subheader = 'Recieved $' .. amount,
        type = "noti",
        timeout = 2000
    })

    SendReactMessage("UpdateBank", QBCore.Functions.GetPlayerData().money.bank)
end)

RegisterNetEvent("ecrp-phone:client:UpdateBank", function(amount, add)
    local playerData = QBCore.Functions.GetPlayerData()
    local newmoney = add and playerData.money.bank + amount or playerData.money.bank - amount

    SendReactMessage("UpdateBank", playerData.money.bank)
end)

RegisterNetEvent("ecrp-phone:client:SendDeclinedNoti", function(amount, add)
    SendReactMessage("SetNoti", {
        open = true,
        icon = "bank",
        iconBg = "from-cyan-600 to-emerald-600",
        header = 'Wallet',
        subheader = "Charge declined",
        type = "noti",
        timeout = 2000
    })
end)

RegisterNetEvent("ecrp-phone:client:SendTwinstaNotis", function(message, data)
    SendReactMessage("NewTwinsta", data)
    SendReactMessage("SetNoti", {
        open = true,
        icon = "camera",
        iconBg = "from-fuchsia-500 to-red-500",
        header = 'Twinsta',
        subheader = message,
        type = "noti",
        timeout = 2000
    })
end)

-- Event Handlers
AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    toggleNuiFrame(false)
    isOpen = false
    StopAnimTask(PlayerPedId(), AnimationData.lib, AnimationData.anim, 2.5)
    deletePhone();
end)

-- Threads
CreateThread(function()
    while true do
        if isOpen then
            SendReactMessage("UpdateTime", CalculateTimeToDisplay())
        end
        Wait(1000)
    end
end)

CreateThread(function()
    while true do
        -- Wait(60000)
        Wait(5000)
        if LocalPlayer.state.isLoggedIn then
            QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPhoneData', function(pData)
                if pData.PlayerContacts ~= nil and next(pData.PlayerContacts) ~= nil then
                    contacts = pData.PlayerContacts
                end

                if pData.Chats ~= nil and next(pData.Chats) ~= nil then
                    local Chats = {}
                    for _, v in pairs(pData.Chats) do
                        Chats[v.number] = {
                            name = IsNumberInContacts(v.number),
                            number = v.number,
                            messages = json.decode(v.messages)
                        }
                    end

                    chats = Chats
                end

                if pData.Tweets ~= nil and next(pData.Tweets) ~= nil then
                    tweets = pData.Tweets
                end

                SendReactMessage("UpdateContacts", contacts)
                SendReactMessage("UpdateChat", chats)
                SendReactMessage("UpdateTwinsta", tweets)
            end)
        end
    end
end)

local function OpenPhone()
    QBCore.Functions.TriggerCallback('ecrp-phone:server:HasPhone', function(HasPhone)
        if HasPhone then
            toggleNuiFrame(true)
            isOpen = true

            if not inCall then
                DoPhoneAnimation('cellphone_text_in')
            else
                DoPhoneAnimation('cellphone_call_to_text')
            end

            SetTimeout(250, function()
                newPhoneProp()
            end)

            QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPlayerVehicles', function(vehicles)
                garageVehicles = vehicles
            end)

            QBCore.Functions.TriggerCallback('ecrp-phone:server:GetPlayerHouses', function(houses)
                ownedHouses = houses
            end)
        else
            QBCore.Functions.Notify("You don't have a phone", 'error')
        end
    end)
end

RegisterCommand('phone', function()
    local PlayerData = QBCore.Functions.GetPlayerData()
    if not isOpen and LocalPlayer.state.isLoggedIn then
        if not PlayerData.metadata['ishandcuffed'] and not PlayerData.metadata['inlaststand'] and
            not PlayerData.metadata['isdead'] and not IsPauseMenuActive() then
            OpenPhone()
        end
    end
end)

-- Disable P from opening map
CreateThread(function()
    while true do
        DisableControlAction(0, 199, true)
        Wait(0)
    end
end)
RegisterKeyMapping('phone', 'Open Phone', 'keyboard', 'P')

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    LoadPhone()
end)

CreateThread(function()
    Wait(500)
    LoadPhone()
end)
