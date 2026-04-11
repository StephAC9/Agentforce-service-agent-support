public with sharing class Overlay_SendEvents {

    /* ==========================
       INPUT FROM FLOW
       ========================== */
    public class Input {
        @InvocableVariable(required=true)
        public List<String> campaignEventIds;
    }

    /* ==========================
       OUTPUT TO FLOW (DEBUG)
       ========================== */
    public class Output {
        @InvocableVariable public String status;
        @InvocableVariable public String message;
    }

    /* ==========================
       INVOCABLE METHOD
       ========================== */
    @InvocableMethod(label='Send Agent Selected Events to Overlay')
    public static List<Output> send(List<Input> inputs) {

        Output out = new Output();

        // Defensive checks
        if (inputs == null || inputs.isEmpty()) {
            out.status = 'SKIPPED';
            out.message = 'No input provided to Overlay_SendEvents.';
            return new List<Output>{ out };
        }

        List<String> ids = inputs[0].campaignEventIds;
        if (ids == null || ids.isEmpty()) {
            out.status = 'SKIPPED';
            out.message = 'Agent returned no selected event IDs.';
            return new List<Output>{ out };
        }

        // Query ONLY agent-selected events
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
            out.status = 'SKIPPED';
            out.message = 'No Campaign_Event__c records found for given IDs.';
            return new List<Output>{ out };
        }

        // Build overlay DTOs
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

        // Fire-and-forget overlay update
        System.enqueueJob(
            new OverlayEventCalloutJob(overlayEvents)
        );

        // Debug output (DO NOT imply HTTP success)
        out.status = 'ENQUEUED';
        out.message =
            'Overlay update queued with ' +
            overlayEvents.size() +
            ' agent-selected events.';

        return new List<Output>{ out };
    }
}