public with sharing class CallMeUp {

    // =========================================================
    // CONFIGURATION  (RECOMMENDED: move to Named Credentials)
    // =========================================================
    private static final String CLIENT_ID            = '';
    private static final String CLIENT_SECRET        = '';
    private static final String API_DOMAIN           = ''; // e.g. mc123
    private static final String EVENT_DEFINITION_KEY = 'AgentForceServiceAPIEvent'; // Journey Event Definition Key
    private static final String SOURCE_OBJECT_ID     = 'LeadsCaptureMaster'; // Optional but recommended
    private static final String SALT                 = ''; // same for all emails


    // =========================================================
    // INPUT (FROM FLOW / AGENTFORCE)
    // =========================================================
    public class Input {
        @InvocableVariable(required=true)
        public String email;

        @InvocableVariable(required=true)
        public String name;

        @InvocableVariable(required=true)
        public String phoneNumber;

        @InvocableVariable(required=true)
        public String company;

        @InvocableVariable
        public String cvr;

        @InvocableVariable
        public String accountId;

        @InvocableVariable(required=true)
        public String topic;
    }


    // =========================================================
    // OUTPUT (TO FLOW)
    // =========================================================
    public class Output {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
    }


    // =========================================================
    // MAIN INVOCABLE METHOD
    // =========================================================
    @InvocableMethod(label='Ring Me Up (MC Interaction Event)')
    public static List<Output> process(List<Input> inputs) {

        List<Output> results = new List<Output>();

        // Retrieve OAuth token once per transaction
        String accessToken = getAccessToken();
        if (accessToken == null) {
            for (Input i : inputs) {
                Output o = new Output();
                o.status  = 'Error';
                o.message = 'Failed to retrieve Marketing Cloud access token.';
                results.add(o);
            }
            return results;
        }

        for (Input i : inputs) {
            Output result = new Output();

            try {
                // Normalize email
                String normalizedEmail = i.email != null
                    ? i.email.trim().toLowerCase()
                    : null;

                // Generate ContactKey (MD5)
                String contactKey = generateMD5(normalizedEmail + SALT);

                // -------------------------------------------------
                // Interaction Event Payload
                // -------------------------------------------------
                Map<String, Object> body = new Map<String, Object>{
                    'ContactKey' => contactKey,
                    'EventDefinitionKey' => EVENT_DEFINITION_KEY,
                    'SourceObjectId' => SOURCE_OBJECT_ID,
                    'Data' => new Map<String, Object>{
                        'SubscriberKey'         => contactKey,
                        'Email'             => normalizedEmail,
                        'LastName'              => i.name,
                        'Phone'             => i.phoneNumber,
                        'Company'           => i.company,
                        'Cvr'               => i.cvr != null ? i.cvr : '00000000',
                        'Category'          => 'Rmo',
                        'ContactAbout'      => i.topic,
                        'FormName'          => 'Call_Me_Up',
                        'AccountId'         => i.accountId,
                        'ProductOfInterest' => 'Rådgivning',
                        'Source'            => 'Agentforce AI Agent',
                        'Type'              => 'Sales Qualified Lead (SQL)',
                        'SourceURL'         => 'tdc.dk'
                    }
                };

                // -------------------------------------------------
                // HTTP REQUEST
                // -------------------------------------------------
                HttpRequest req = new HttpRequest();
                req.setEndpoint(
                    'https://' + API_DOMAIN +
                    '.rest.marketingcloudapis.com/interaction/v1/events'
                );
                req.setMethod('POST');
                req.setHeader('Content-Type', 'application/json');
                req.setHeader('Authorization', 'Bearer ' + accessToken);
                req.setTimeout(10000);
                req.setBody(JSON.serialize(body));

                HttpResponse res = new Http().send(req);

                // -------------------------------------------------
                // RESPONSE HANDLING
                // -------------------------------------------------
                Integer statusCode = res.getStatusCode();
                if (statusCode >= 200 && statusCode < 300) {
                    result.status  = 'Success';
                    result.message = 'Interaction Event published successfully.';
                } else {
                    result.status  = 'Error';
                    result.message = 'MC API returned ' + statusCode + ': ' + res.getBody();
                    System.debug(LoggingLevel.ERROR, res.getBody());
                }

            } catch (Exception ex) {
                result.status  = 'Exception';
                result.message = ex.getMessage();
                System.debug(LoggingLevel.ERROR, ex);
            }

            results.add(result);
        }

        return results;
    }


    // =========================================================
    // OAUTH TOKEN
    // =========================================================
    private static String getAccessToken() {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(
                'https://' + API_DOMAIN + '.auth.marketingcloudapis.com/v2/token'
            );
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');

            req.setBody(JSON.serialize(new Map<String, String>{
                'grant_type'    => 'client_credentials',
                'client_id'     => CLIENT_ID,
                'client_secret' => CLIENT_SECRET
            }));

            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
                Map<String, Object> json =
                    (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                return (String) json.get('access_token');
            } else {
                System.debug(LoggingLevel.ERROR, 'Token error: ' + res.getBody());
            }

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e);
        }

        return null;
    }


    // =========================================================
    // MD5 HASH FUNCTION
    // =========================================================
    private static String generateMD5(String input) {
        Blob hash = Crypto.generateDigest('MD5', Blob.valueOf(input));
        return EncodingUtil.convertToHex(hash);
    }
}
