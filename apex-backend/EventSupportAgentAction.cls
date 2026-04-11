global without sharing class EventSupportAgentAction {

    // ===== INPUT FROM FLOW / AGENT =====
    // Comma-separated list of Campaign_Event__c Ids
    public class Input {
        @InvocableVariable(required = true)
        public String campaignEventIds; // e.g. "a0Bxx,a0Cyy,"
    }

    // ===== OUTPUT BACK TO AGENT =====
    public class Output {
        @InvocableVariable
        public String status; // SUCCESS | FAILURE

        @InvocableVariable
        public String message; // Human-readable result text
    }

    @InvocableMethod(label='Send Agent Selected Events to Overlay')
    public static List<Output> send(List<Input> inputs) {

        Output result = new Output();

        // ---- Defensive checks ----
        if (inputs == null || inputs.isEmpty()) {
            result.status = 'FAILURE';
            result.message = 'No input provided from agent.';
            return new List<Output>{ result };
        }

        String rawIds = inputs[0].campaignEventIds;
        if (String.isBlank(rawIds)) {
            result.status = 'FAILURE';
            result.message = 'Campaign event Ids input is empty.';
            return new List<Output>{ result };
        }

        // ---- Parse CSV Ids ----
        Set<Id> ids = new Set<Id>();
        for (String idValue : rawIds.split('_')) {
            String trimmed = idValue.trim();
            if (!String.isBlank(trimmed)) {
                try {
                    ids.add((Id) trimmed);
                } catch (Exception e) {
                    // Ignore invalid Ids to keep deterministic behavior
                }
            }
        }

        if (ids.isEmpty()) {
            result.status = 'FAILURE';
            result.message = 'No valid campaign event Ids found after parsing.';
            return new List<Output>{ result };
        }

        // ---- Query selected events ----
        List<Campaign_Event__c> records = [
            SELECT
                Id,
                Name,
                Description__c,
                Start_Date__c,
                End_Date__c,
                City__c,
                Country__c,
                Category__c,
                Page_URL__c
            FROM Campaign_Event__c
            WHERE Id IN :ids
        ];

        if (records.isEmpty()) {
            result.status = 'FAILURE';
            result.message = 'No campaign events matched the provided Ids.';
            return new List<Output>{ result };
        }

        // ---- Build overlay DTOs ----
        List<SupportEventOverlayDTO> overlayEvents =
            new List<SupportEventOverlayDTO>();

        for (Campaign_Event__c e : records) {
            SupportEventOverlayDTO dto = new SupportEventOverlayDTO();
            dto.id = e.Id;
            dto.name = e.Name;
            dto.description = e.Description__c;
            dto.city = e.City__c;
            dto.country = e.Country__c;
            dto.startDate = String.valueOf(e.Start_Date__c);
            dto.endDate = String.valueOf(e.End_Date__c);
            dto.category = e.Category__c;
            dto.pageUrl = e.Page_URL__c;

            overlayEvents.add(dto);
        }

        // ---- Fire-and-forget async callout ----
            // TEMPORARY ONLY — for debugging
new OverlayEventCalloutJob(overlayEvents)
    .execute(null);

        // ---- Deterministic success response ----
        result.status = 'SUCCESS';
        result.message =
            'Successfully sent ' + overlayEvents.size() +
            ' campaign event(s) to the support overlay.';

        return new List<Output>{ result };
    }
}