global class SupportEventChatItem {

    @AuraEnabled public String id;
    @AuraEnabled public String name;
    @AuraEnabled public String description;
    @AuraEnabled public String city;
    @AuraEnabled public String country;
    @AuraEnabled public String location;
    @AuraEnabled public Date startDate;
    @AuraEnabled public Date endDate;
    @AuraEnabled public String dateRange;
    @AuraEnabled public String pageUrl;
    @AuraEnabled public String logoUrl;
    @AuraEnabled public String category;
    @AuraEnabled public String type;
    @AuraEnabled public Boolean isReccurent;
    @AuraEnabled public Boolean directRegistration;

    public SupportEventChatItem () {}
}
