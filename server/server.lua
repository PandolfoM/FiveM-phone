local QBCore = exports['qb-core']:GetCoreObject()
local Calls = {}

-- Functions
local function GetOnlineStatus(number)
    local Target = QBCore.Functions.GetPlayerByPhone(number)
    local retval = false
    if Target ~= nil then
        retval = true
    end
    return retval
end

-- Callbacks
QBCore.Functions.CreateCallback('ecrp-phone:server:GetContactPictures', function(_, cb, Chats)
    for _, v in pairs(Chats) do
        local query = '%' .. v.number .. '%'
        local result = MySQL.query.await('SELECT * FROM players WHERE charinfo LIKE ?', {query})
        if result[1] ~= nil then
            local MetaData = json.decode(result[1].metadata)

            if MetaData.phone.profilepicture ~= nil then
                v.picture = MetaData.phone.profilepicture
            else
                v.picture = 'default'
            end
        end
    end
    SetTimeout(100, function()
        cb(Chats)
    end)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetContactPicture', function(_, cb, Chat)
    local query = '%' .. Chat.number .. '%'
    local result = MySQL.query.await('SELECT * FROM players WHERE charinfo LIKE ?', {query})
    local MetaData = json.decode(result[1].metadata)
    if MetaData.phone.profilepicture ~= nil then
        Chat.picture = MetaData.phone.profilepicture
    else
        Chat.picture = 'default'
    end
    SetTimeout(100, function()
        cb(Chat)
    end)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetPicture', function(_, cb, number)
    local query = '%' .. number .. '%'
    local result = MySQL.query.await('SELECT * FROM players WHERE charinfo LIKE ?', {query})
    if result[1] ~= nil then
        local Picture = 'default'
        local MetaData = json.decode(result[1].metadata)
        if MetaData.phone.profilepicture ~= nil then
            Picture = MetaData.phone.profilepicture
        end
        cb(Picture)
    else
        cb(nil)
    end
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetPhoneData', function(source, cb)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player ~= nil then

        local PhoneData = {
            Applications = {},
            PlayerContacts = {},
            MentionedTweets = {},
            Chats = {},
            Hashtags = {},
            Invoices = {},
            Garage = {},
            Mails = {},
            Adverts = {},
            CryptoTransactions = {},
            Tweets = {},
            Images = {},
            InstalledApps = Player.PlayerData.metadata['phonedata'].InstalledApps
        }

        local result = MySQL.query.await('SELECT * FROM player_contacts WHERE citizenid = ? ORDER BY name ASC',
            {Player.PlayerData.citizenid})
        if result[1] ~= nil then
            for _, v in pairs(result) do
                v.status = GetOnlineStatus(v.number)
            end

            PhoneData.PlayerContacts = result
        end

        local invoices = MySQL.query.await('SELECT * FROM phone_invoices WHERE citizenid = ?',
            {Player.PlayerData.citizenid})
        if invoices[1] ~= nil then
            for _, v in pairs(invoices) do
                local Ply = QBCore.Functions.GetPlayerByCitizenId(v.sender)
                if Ply ~= nil then
                    v.number = Ply.PlayerData.charinfo.phone
                else
                    local res = MySQL.query.await('SELECT * FROM players WHERE citizenid = ?', {v.sender})
                    if res[1] ~= nil then
                        res[1].charinfo = json.decode(res[1].charinfo)
                        v.number = res[1].charinfo.phone
                    else
                        v.number = nil
                    end
                end
            end
            PhoneData.Invoices = invoices
        end

        local garageresult = MySQL.query.await('SELECT * FROM player_vehicles WHERE citizenid = ?',
            {Player.PlayerData.citizenid})
        if garageresult[1] ~= nil then
            PhoneData.Garage = garageresult
        end

        local messages = MySQL.query.await('SELECT * FROM phone_messages WHERE citizenid = ?',
            {Player.PlayerData.citizenid})
        if messages ~= nil and next(messages) ~= nil then
            PhoneData.Chats = messages
        end

        local Tweets = MySQL.query.await('SELECT * FROM phone_twinsta ORDER BY id DESC LIMIT 50')

        if Tweets ~= nil and next(Tweets) ~= nil then
            PhoneData.Tweets = Tweets
            TWData = Tweets
        end

        cb(PhoneData)
    end
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:HasPhone', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if Player ~= nil then
        local HasPhone = Player.Functions.GetItemByName('phone')
        if HasPhone ~= nil then
            cb(true)
        else
            cb(false)
        end
    end
end)

QBCore.Functions.CreateCallback("ecrp-phone:server:GetPlayerVehicles", function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    local Vehicles = {}

    MySQL.query('SELECT * FROM player_vehicles WHERE citizenid = ?', {Player.PlayerData.citizenid}, function(result)
        if result[1] ~= nil then
            for _, v in pairs(result) do
                local VehicleData = QBCore.Shared.Vehicles[v.vehicle]
                if not VehicleData then
                    goto continue
                end

                local VehicleGarage = "None"
                if v.garage ~= nil then
                    VehicleGarage = v.garage
                end

                if v.state == 0 then
                    v.state = "Out"
                elseif v.state == 1 then
                    v.state = "Stored"
                elseif v.state == 2 then
                    v.state = "Impounded"
                end

                local fullname
                if VehicleData["brand"] ~= nil then
                    fullname = VehicleData["brand"] .. " " .. VehicleData["name"]
                else
                    fullname = VehicleData["name"]
                end

                Vehicles[#Vehicles + 1] = {
                    fullname = fullname,
                    brand = VehicleData["brand"],
                    model = VehicleData["name"],
                    plate = string.upper(v.plate),
                    garage = VehicleGarage,
                    state = v.state
                }
                ::continue::
            end
            cb(Vehicles)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback("ecrp-phone:server:GetPlayerHouses", function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    local Houses = {}

    MySQL.query('SELECT * FROM player_houses WHERE citizenid = ?', {Player.PlayerData.citizenid}, function(result)
        if result[1] ~= nil then
            for _, v in pairs(result) do

                local houseData = MySQL.query.await("SELECT * FROM houselocations WHERE name = ?", {v.house})

                if houseData[1] ~= nil then
                    for _, v in pairs(houseData) do
                        local coords = json.decode(v.coords)
                        Houses[#Houses + 1] = {
                            house = v.label,
                            coordsX = coords['enter']["x"],
                            coordsY = coords['enter']["y"],
                            coordsZ = coords['enter']["z"]
                        }
                    end
                end
            end
            cb(Houses)
        else
            cb(nil)
        end
    end)
end)

QBCore.Functions.CreateCallback("ecrp-phone:server:GetBankBalance", function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    MySQL.query('SELECT money FROM players WHERE citizenid = ?', {Player.PlayerData.citizenid}, function(result)
        if result[1] ~= nil then
            local money = json.decode(result[1].money)
            cb(money.bank)
        else
            cb("0")
        end
    end)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetDirectoryPosts', function(_, cb)
    local Posts = {}

    MySQL.query('SELECT * FROM phone_directory ORDER BY id DESC LIMIT 50', function(result)
        if result[1] ~= nil then
            for _, v in pairs(result) do
                Posts[#Posts + 1] = {
                    citizenid = v.citizenid,
                    name = v.name,
                    number = v.number,
                    message = v.message,
                    date = v.date
                }
            end
            cb(Posts)
        else
            cb({})
        end
    end)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:NewDirectoryPost', function(source, cb, message)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local PlyData = {
        citizenid = Player.PlayerData.citizenid,
        name = tostring(Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname),
        number = Player.PlayerData.charinfo.phone,
        message = message
    }

    MySQL.insert('INSERT INTO phone_directory (citizenid, name, number, message) VALUES (?, ?, ?, ?)',
        {Player.PlayerData.citizenid,
         tostring(Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname),
         Player.PlayerData.charinfo.phone, message})
    cb(PlyData)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:NewTwinstaPost', function(source, cb, message)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local PlyData = {
        citizenid = Player.PlayerData.citizenid,
        name = tostring("@"..Player.PlayerData.charinfo.firstname .. "_" .. Player.PlayerData.charinfo.lastname),
        number = Player.PlayerData.charinfo.phone,
        message = message
    }

    MySQL.insert('INSERT INTO phone_twinsta (citizenid, name, message) VALUES (?, ?, ?)', {Player.PlayerData.citizenid,
                                                                                           tostring(
        "@" .. Player.PlayerData.charinfo.firstname .. "_" .. Player.PlayerData.charinfo.lastname), message})

    for _, v in pairs(QBCore.Functions.GetQBPlayers()) do
      if v then
        if Player.PlayerData.citizenid ~= v.PlayerData.citizenid then
          TriggerClientEvent("ecrp-phone:client:SendTwinstaNotis", v.PlayerData.source, message, PlyData)
        end
      end
    end

    cb(PlyData)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetSettings', function(source, cb, message)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local Settings = {
        background = Player.PlayerData.metadata['phonedata'].background,
        name = Player.PlayerData.metadata['phonedata'].muted,
        number = Player.PlayerData.metadata['phonedata'].mutednoti
    }

    cb(Settings)
end)

QBCore.Functions.CreateCallback('ecrp-phone:server:GetPlayerJobs', function(_, cb)
    local data = {
        lawyers = {},
        judges = {},
        medics = {}
    }

    for _, v in pairs(QBCore.Functions.GetQBPlayers()) do
        if v then
            local fullName = v.PlayerData.charinfo.firstname .. " " .. v.PlayerData.charinfo.lastname
            local jobData = {
                name = fullName,
                number = v.PlayerData.charinfo.phone
            }

            if v.PlayerData.job.name == "lawyer" and v.PlayerData.job.onduty then
                table.insert(data.lawyers, jobData)
            elseif v.PlayerData.job.name == "judge" and v.PlayerData.job.onduty then
                table.insert(data.judges, jobData)
            elseif v.PlayerData.job.name == "medic" and v.PlayerData.job.onduty then
                table.insert(data.medics, jobData)
            end
        end
    end

    cb(data)
end)

-- Events

RegisterNetEvent("ecrp-phone:server:SaveSettings", function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local result = MySQL.query.await('SELECT * FROM players WHERE citizenid = ?', {Player.PlayerData.citizenid})
    local MetaData = json.decode(result[1].metadata)
    MetaData.phone = data
    MySQL.update('UPDATE players SET metadata = ? WHERE citizenid = ?',
        {json.encode(MetaData), Player.PlayerData.citizenid})
    Player.Functions.SetMetaData('phone', data)
    -- local src = source
    -- local Ply = QBCore.Functions.GetPlayer(src)

    -- MySQL.update(
    --     'UPDATE players SET metadata = JSON_SET(metadata, "$.phonedata.background", ?), metadata = JSON_SET(metadata, "$.phonedata.muted", ?), metadata = JSON_SET(metadata, "$.phonedata.mutedNoti", ?) WHERE citizenid = ?',
    --     {data.background, data.muted, data.mutedNoti, Ply.PlayerData.citizenid})
end)

RegisterNetEvent("ecrp-phone:server:DeleteDirectoryPost", function(cid)
    MySQL.query('DELETE FROM phone_directory WHERE citizenid = ?', {cid})
end)

RegisterNetEvent("ecrp-phone:server:CancelCall", function(number)
    local Ply = QBCore.Functions.GetPlayerByPhone(number)
    if Ply ~= nil then
        TriggerClientEvent('ecrp-phone:client:CancelCall', Ply.PlayerData.source)
    end
end)

RegisterNetEvent("ecrp-phone:server:CallContact", function(number, callId)
    local src = source
    local Ply = QBCore.Functions.GetPlayer(src)
    local Target = QBCore.Functions.GetPlayerByPhone(number)
    if Target ~= nil then
        TriggerClientEvent('ecrp-phone:client:GetCalled', Target.PlayerData.source, Ply.PlayerData.charinfo.phone,
            callId)
    end
end)

RegisterNetEvent('ecrp-phone:server:SetCallState', function(bool)
    local src = source
    local Ply = QBCore.Functions.GetPlayer(src)
    if Calls[Ply.PlayerData.citizenid] ~= nil then
        Calls[Ply.PlayerData.citizenid].inCall = bool
    else
        Calls[Ply.PlayerData.citizenid] = {}
        Calls[Ply.PlayerData.citizenid].inCall = bool
    end
end)

RegisterNetEvent('ecrp-phone:server:AnswerCall', function(number)
    local Ply = QBCore.Functions.GetPlayerByPhone(number)
    if Ply ~= nil then
        TriggerClientEvent('ecrp-phone:client:AnswerCall', Ply.PlayerData.source)
    end
end)

RegisterNetEvent('ecrp-phone:server:AddRecentCall', function(type, data)
    local src = source
    local Ply = QBCore.Functions.GetPlayer(src)
    local Hour = os.date('%H')
    local Minute = os.date('%M')
    local label = Hour .. ':' .. Minute
    TriggerClientEvent('ecrp-phone:client:AddRecentCall', src, data, label, type)
    local Trgt = QBCore.Functions.GetPlayerByPhone(data.number)
    if Trgt ~= nil then
        TriggerClientEvent('ecrp-phone:client:AddRecentCall', Trgt.PlayerData.source, {
            name = Ply.PlayerData.charinfo.firstname .. ' ' .. Ply.PlayerData.charinfo.lastname,
            number = Ply.PlayerData.charinfo.phone
        }, label, 'outgoing')
    end
end)

RegisterNetEvent('ecrp-phone:server:AddNewContact', function(name, number, iban)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    MySQL.insert('INSERT INTO player_contacts (citizenid, name, number, iban) VALUES (?, ?, ?, ?)',
        {Player.PlayerData.citizenid, tostring(name), tostring(number), tostring(iban)})
end)

RegisterNetEvent('ecrp-phone:server:RemoveContact', function(name, number)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    MySQL.query('DELETE FROM player_contacts WHERE name = ? AND number = ? AND citizenid = ?',
        {name, number, Player.PlayerData.citizenid})
end)

RegisterNetEvent('ecrp-phone:server:EditContact', function(newName, newNumber, newIban, oldName, oldNumber, _)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    MySQL.update(
        'UPDATE player_contacts SET name = ?, number = ?, iban = ? WHERE citizenid = ? AND name = ? AND number = ?',
        {newName, newNumber, newIban, Player.PlayerData.citizenid, oldName, oldNumber})
end)

RegisterNetEvent('ecrp-phone:server:UpdateMessages', function(ChatMessages, ChatNumber, _)
    local src = source
    local SenderData = QBCore.Functions.GetPlayer(src)
    local query = '%' .. ChatNumber .. '%'
    local Player = MySQL.query.await('SELECT * FROM players WHERE charinfo LIKE ?', {query})
    if Player[1] ~= nil then
        local TargetData = QBCore.Functions.GetPlayerByCitizenId(Player[1].citizenid)
        if TargetData ~= nil then
            local Chat = MySQL.query.await('SELECT * FROM phone_messages WHERE citizenid = ? AND number = ?',
                {SenderData.PlayerData.citizenid, ChatNumber})
            if Chat[1] ~= nil then
                -- Update for target
                MySQL.update('UPDATE phone_messages SET messages = ? WHERE citizenid = ? AND number = ?', {json.encode(
                    ChatMessages), TargetData.PlayerData.citizenid, SenderData.PlayerData.charinfo.phone})
                -- Update for sender
                MySQL.update('UPDATE phone_messages SET messages = ? WHERE citizenid = ? AND number = ?', {json.encode(
                    ChatMessages), SenderData.PlayerData.citizenid, TargetData.PlayerData.charinfo.phone})
                -- Send notification & Update messages for target
                TriggerClientEvent('ecrp-phone:client:UpdateMessages', TargetData.PlayerData.source, ChatMessages,
                    SenderData.PlayerData.charinfo.phone, false)
            else
                -- Insert for target
                MySQL.insert('INSERT INTO phone_messages (citizenid, number, messages) VALUES (?, ?, ?)',
                    {TargetData.PlayerData.citizenid, SenderData.PlayerData.charinfo.phone, json.encode(ChatMessages)})
                -- Insert for sender
                MySQL.insert('INSERT INTO phone_messages (citizenid, number, messages) VALUES (?, ?, ?)',
                    {SenderData.PlayerData.citizenid, TargetData.PlayerData.charinfo.phone, json.encode(ChatMessages)})
                -- Send notification & Update messages for target
                TriggerClientEvent('ecrp-phone:client:UpdateMessages', TargetData.PlayerData.source, ChatMessages,
                    SenderData.PlayerData.charinfo.phone, true)
            end
        else
            local Chat = MySQL.query.await('SELECT * FROM phone_messages WHERE citizenid = ? AND number = ?',
                {SenderData.PlayerData.citizenid, ChatNumber})
            if Chat[1] ~= nil then
                -- Update for target
                MySQL.update('UPDATE phone_messages SET messages = ? WHERE citizenid = ? AND number = ?',
                    {json.encode(ChatMessages), Player[1].citizenid, SenderData.PlayerData.charinfo.phone})
                -- Update for sender
                Player[1].charinfo = json.decode(Player[1].charinfo)
                MySQL.update('UPDATE phone_messages SET messages = ? WHERE citizenid = ? AND number = ?',
                    {json.encode(ChatMessages), SenderData.PlayerData.citizenid, Player[1].charinfo.phone})
            else
                -- Insert for target
                MySQL.insert('INSERT INTO phone_messages (citizenid, number, messages) VALUES (?, ?, ?)',
                    {Player[1].citizenid, SenderData.PlayerData.charinfo.phone, json.encode(ChatMessages)})
                -- Insert for sender
                Player[1].charinfo = json.decode(Player[1].charinfo)
                MySQL.insert('INSERT INTO phone_messages (citizenid, number, messages) VALUES (?, ?, ?)',
                    {SenderData.PlayerData.citizenid, Player[1].charinfo.phone, json.encode(ChatMessages)})
            end
        end
    end
end)

RegisterNetEvent('ecrp-phone:server:TransferMoney', function(amount, stateId)
    local src = source
    local sender = QBCore.Functions.GetPlayer(src)
    local result = MySQL.query.await('SELECT * FROM players WHERE citizenid = ?', {stateId})
    if result[1] ~= nil then
        local reciever = QBCore.Functions.GetPlayerByCitizenId(result[1].citizenid)

        if reciever ~= nil then
            local PhoneItem = reciever.Functions.GetItemByName('phone')
            reciever.Functions.AddMoney('bank', amount, 'phone-transfered-from-' .. sender.PlayerData.citizenid)
            sender.Functions.RemoveMoney('bank', amount, 'phone-transfered-to-' .. reciever.PlayerData.citizenid)

            if PhoneItem ~= nil then
                TriggerClientEvent('ecrp-phone:client:TransferMoney', reciever.PlayerData.source, amount,
                    reciever.PlayerData.money.bank)
            end
        else
            local moneyInfo = json.decode(result[1].money)
            moneyInfo.bank = round((moneyInfo.bank + amount))
            MySQL.update('UPDATE players SET money = ? WHERE citizenid = ?',
                {json.encode(moneyInfo), result[1].citizenid})
            sender.Functions.RemoveMoney('bank', amount, 'phone-transfered')
        end
    else
        TriggerClientEvent('QBCore:Notify', src, "This state ID doesn't exist!", 'error')
    end
end)

RegisterNetEvent('ecrp-phone:server:ChargePlayer', function(amount, stateId)
    local src = source
    local sender = QBCore.Functions.GetPlayer(src)
    local result = MySQL.query.await('SELECT * FROM players WHERE citizenid = ?', {stateId})
    if result[1] ~= nil then
        local reciever = QBCore.Functions.GetPlayerByCitizenId(result[1].citizenid)
        TriggerClientEvent("ecrp-phone:client:RequestInvoice", reciever.PlayerData.source, amount,
            sender.PlayerData.citizenid)

        -- if reciever ~= nil then
        --     local PhoneItem = reciever.Functions.GetItemByName('phone')
        --     reciever.Functions.AddMoney('bank', amount, 'phone-transfered-from-' .. sender.PlayerData.citizenid)
        --     sender.Functions.RemoveMoney('bank', amount, 'phone-transfered-to-' .. reciever.PlayerData.citizenid)

        --     if PhoneItem ~= nil then
        --         TriggerClientEvent('ecrp-phone:client:TransferMoney', reciever.PlayerData.source, amount,
        --             reciever.PlayerData.money.bank)
        --     end
        -- else
        --     local moneyInfo = json.decode(result[1].money)
        --     moneyInfo.bank = round((moneyInfo.bank + amount))
        --     MySQL.update('UPDATE players SET money = ? WHERE citizenid = ?',
        --         {json.encode(moneyInfo), result[1].citizenid})
        --     sender.Functions.RemoveMoney('bank', amount, 'phone-transfered')
        -- end
    else
        TriggerClientEvent('QBCore:Notify', src, "This state ID doesn't exist!", 'error')
    end
end)

RegisterNetEvent("ecrp-phone:server:AcceptCharge", function(amount, stateId)
    local src = source
    local sender = QBCore.Functions.GetPlayer(src)
    local reciever = QBCore.Functions.GetPlayerByCitizenId(stateId)

    reciever.Functions.AddMoney('bank', amount, 'phone-transfered-from-' .. sender.PlayerData.citizenid)
    sender.Functions.RemoveMoney('bank', amount, 'phone-transfered-to-' .. reciever.PlayerData.citizenid)

    TriggerClientEvent("ecrp-phone:client:UpdateBank", sender.PlayerData.source, amount, false)
    TriggerClientEvent("ecrp-phone:client:UpdateBank", reciever.PlayerData.source, amount, true)
end)

RegisterNetEvent("ecrp-phone:server:DeclineCharge", function(stateId)
    local reciever = QBCore.Functions.GetPlayerByCitizenId(stateId)
    TriggerClientEvent("ecrp-phone:client:SendDeclinedNoti", reciever.PlayerData.source)
end)
