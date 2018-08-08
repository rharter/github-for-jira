const format = require('date-fns/format')
const { Subscription } = require('../models')

module.exports = async (req, res) => {
  const jiraHost = req.query.xdm_e

  const subscriptions = await Subscription.getAllForHost(jiraHost)
  const connections = (await Promise.all(subscriptions.map(subscription => res.locals.client.apps.getInstallation({ installation_id: subscription.gitHubInstallationId }))))
    .map(response => response.data)
    .map(data => ({
      ...data,
      isGlobalInstall: data.repository_selection === 'all',
      updated_at: format(data.updated_at, 'MMMM D, YYYY h:mm a')
    }))

  res.render('jira-configuration.hbs', {
    host: req.query.xdm_e,
    connections: connections
  })
}